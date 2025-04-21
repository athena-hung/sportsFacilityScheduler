const express = require('express');
const router = express.Router();
const db = require('../db');

const VALID_STATUSES = ['available', 'maintenance', 'reserved', 'closed'];
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

// Helper function to validate court data
const validateCourtData = (data) => {
  const errors = [];
  
  if (!data.name?.trim()) {
    errors.push('Court name is required');
  }
  
  if (!data.status || !VALID_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  
  if (!data.org_id) {
    errors.push('Organization ID is required');
  }

  return errors;
};

// GET /court with filters and pagination
router.get('/', async (req, res) => {
  try {
    const {
      name,
      status,
      court_type_id,
      org_id,
      page = 1,
      limit = DEFAULT_PAGE_SIZE,
      sort_by = 'name',
      sort_order = 'asc'
    } = req.query;

    let effectiveOrgId = org_id;
    if (!effectiveOrgId && req.user && req.user.org_id) {
      effectiveOrgId = req.user.org_id;
      console.log(`Using authenticated user's org_id: ${effectiveOrgId}`);
    }

    const pageSize = Math.min(parseInt(limit) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const currentPage = Math.max(parseInt(page) || 1, 1);
    const offset = (currentPage - 1) * pageSize;

    const query = db('court')
      .select(
        'court.*',
        'court_type.name as court_type_name',
        'org.name as org_name'
      )
      .leftJoin('court_type', 'court.court_type_id', 'court_type.id')
      .leftJoin('org', 'court.org_id', 'org.id')
      .where((builder) => {
        if (name) {
          builder.whereILike('court.name', `%${name}%`);
        }
        if (status && VALID_STATUSES.includes(status)) {
          builder.where('court.status', status);
        }
        if (court_type_id) {
          builder.where('court.court_type_id', court_type_id);
        }
        if (org_id) {
          builder.where('court.org_id', org_id);
        }
      });

    const [{ count }] = await query.clone().count();

    const courts = await query
      .orderBy(sort_by, sort_order)
      .limit(pageSize)
      .offset(offset);

    res.status(200).json({
      data: courts,
      pagination: {
        total: parseInt(count),
        per_page: pageSize,
        current_page: currentPage,
        total_pages: Math.ceil(count / pageSize)
      }
    });

  } catch (err) {
    console.error('Error fetching courts:', err);
    res.status(500).json({ message: 'Failed to fetch courts', error: err.message });
  }
});

/**
 * GET /court/available - Find available courts with filters.
 * 
 * This endpoint checks each court to see if there's a continuous block of
 * availability equal to the requested duration (in minutes) on any day within
 * the given date range. Candidate start times must lie on a quarter-hour boundary
 * (xx:00, xx:15, xx:30, xx:45).
 * 
 * If optional time_start and time_end are provided (in HH:MM 24hr format), then the
 * available slot must also fall within that period.
 * 
 * Availability is determined by using the open_hour table (default availability)
 * and then subtracting any reserved periods (from reservation) for that day.
 */
router.get('/available', async (req, res) => {
  try {
    console.log("==== STARTING /court/available REQUEST ====");
    console.log("Query parameters:", req.query);
    
    const {
      sport,      
      start_date, 
      end_date,  
      time,       
      time_start, 
      time_end,   
      lat,        
      lng,        
      radius = 25,
      zip,        
      org_id      
    } = req.query;
    
    let effectiveOrgId = org_id;
    if (!effectiveOrgId && req.user && req.user.org_id) {
      effectiveOrgId = req.user.org_id;
      console.log(`Using authenticated user's org_id: ${effectiveOrgId}`);
    }
    
    if (!sport) {
      return res.status(400).json({ message: 'Sport type (court_type) is required' });
    }
    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'Both start_date and end_date are required' });
    }
    
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }
    if (startDateObj > endDateObj) {
      return res.status(400).json({ message: 'start_date must be before or equal to end_date' });
    }
    
    let durationMinutes = 60;
    if (time) {
      durationMinutes = parseInt(time);
      if (isNaN(durationMinutes) || durationMinutes <= 0) {
        return res.status(400).json({ message: 'Time (duration) must be a positive number in minutes' });
      }
    }
    console.log(`Requested duration: ${durationMinutes} minutes`);
    
    let timeStartMinutes = null;
    let timeEndMinutes = null;
    if (time_start && time_end) {
      const timeStartMatch = time_start.match(/^(\d{1,2}):(\d{2})$/);
      const timeEndMatch = time_end.match(/^(\d{1,2}):(\d{2})$/);
      if (!timeStartMatch || !timeEndMatch) {
        return res.status(400).json({ message: 'Invalid time format. Use HH:MM (24hr)' });
      }
      timeStartMinutes = parseInt(timeStartMatch[1]) * 60 + parseInt(timeStartMatch[2]);
      timeEndMinutes = parseInt(timeEndMatch[1]) * 60 + parseInt(timeEndMatch[2]);
      if (timeStartMinutes >= timeEndMinutes) {
        return res.status(400).json({ message: 'time_start must be before time_end' });
      }
      console.log(`Time range constraint: ${time_start} to ${time_end} (${timeStartMinutes}-${timeEndMinutes} minutes)`);
    }
    const searchRange = (timeStartMinutes !== null && timeEndMinutes !== null)
      ? { start: timeStartMinutes, end: timeEndMinutes }
      : null;
    
    let useLocationFilter = false;
    if (lat && lng) {
      if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
        return res.status(400).json({ message: 'Invalid latitude or longitude format' });
      }
      useLocationFilter = true;
      console.log(`Location filter: ${lat}, ${lng} with radius ${radius} miles`);
    }
    
    let matchingCourtTypes;
    try {
      matchingCourtTypes = await db('court_type')
        .whereRaw('LOWER(name) LIKE ?', [`%${sport.toLowerCase()}%`]);
    } catch (err) {
      console.error("Error querying court_type table:", err);
      return res.status(500).json({ message: "Error retrieving court types", error: err.message });
    }
    if (!matchingCourtTypes.length) {
      return res.status(404).json({ message: 'No court types found matching the requested sport' });
    }
    const courtTypeIds = matchingCourtTypes.map(ct => ct.id);
    console.log("Matching court type IDs:", courtTypeIds);
    
    let courts;
    try {
      courts = await db('court')
        .distinct('court.id')
        .select(
          'court.id',
          'court.name as court_name',
          'court.image',
          'court.latitude',
          'court.longitude',
          'court.zip',
          'court.status',
          'org.id as org_id',
          'org.name as org_name'
        )
        .join('org', 'court.org_id', 'org.id')
        .join('court_court_type', 'court.id', 'court_court_type.court_id')
        .where('court.status', 'available')
        .whereIn('court_court_type.court_type_id', courtTypeIds)
        .modify(function(queryBuilder) {
          if (zip) queryBuilder.where('court.zip', zip);
          if (effectiveOrgId) queryBuilder.where('court.org_id', effectiveOrgId);
        });
      
      console.log(`Found ${courts.length} courts matching initial criteria:`, courts.map(c => `${c.id} (${c.court_name})`));
    } catch (err) {
      console.error("Error querying courts:", err);
      return res.status(500).json({ message: "Error retrieving courts", error: err.message });
    }
    
    const dateRange = [];
    let currentDate = new Date(startDateObj);
    while (currentDate <= endDateObj) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    console.log("Date range:", dateRange.map(d => d.toISOString().split('T')[0]));
    
    function calculateDistance(lat1, lon1, lat2, lon2) {
      if (!lat1 || !lon1 || !lat2 || !lon2) {
        return Number.MAX_VALUE; 
      }
      
      const R = 3958.8; 
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      return distance;
    }
    
    function roundUpToQuarter(minutes) {
      return Math.ceil(minutes / 15) * 15;
    }
    
    async function isSlotAvailableForDate(date, courtId, duration, searchRange = null) {
      const dateStr = date.toISOString().split('T')[0]; 
      console.log(`\nChecking availability for Court ${courtId} on ${dateStr}...`);
      
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); 
      
      let openHours;
      try {
        openHours = await db('open_hour')
          .where('court_id', courtId)
          .where('dayOfWeek', dayOfWeek);
      } catch (err) {
        console.error(`Error retrieving open hours for court ${courtId} on day ${dayOfWeek}:`, err);
        return false;
      }
      
      if (!openHours.length) {
        console.log(`Court ${courtId} has no open hours on day ${dayOfWeek} (${dateStr}).`);
        return false;
      }
      
      console.log(`Court ${courtId} on ${dateStr}: Open hours:`, openHours.map(oh => `${oh.startTime}-${oh.endTime}`));
      
      const startOfDayStr = `${dateStr} 00:00:00`;
      const endOfDayStr = `${dateStr} 23:59:59`;
      
      let reservations;
      try {
        reservations = await db('reservation')
          .where('court_id', courtId)
          .where('status', 'Confirmed')
          .whereNot('status', 'Cancelled') 
          .andWhere(function() {
            this.where(function() {
              this.where('start', '>=', startOfDayStr)
                  .andWhere('start', '<=', endOfDayStr);
            })
            .orWhere(function() {
              this.where('end', '>', startOfDayStr)
                  .andWhere('end', '<=', endOfDayStr);
            })
            .orWhere(function() {
              this.where('start', '<', startOfDayStr)
                  .andWhere('end', '>', endOfDayStr);
            });
          });
      } catch (err) {
        console.error(`Error retrieving reservations for court ${courtId} on ${dateStr}:`, err);
        return false;
      }
      
      console.log(`Court ${courtId} on ${dateStr}: Found ${reservations.length} reservations:`, 
        reservations.map(r => `${r.start} to ${r.end} (${r.reason})`));
      
      const reservationIntervals = reservations.map(r => {
        const startParts = r.start.split(' ')[1].split(':').map(Number);
        const endParts = r.end.split(' ')[1].split(':').map(Number);
        
        const resStartMinutes = startParts[0] * 60 + startParts[1];
        const resEndMinutes = endParts[0] * 60 + endParts[1];
        
        return {
          start: resStartMinutes,
          end: resEndMinutes,
          startTime: `${startParts[0]}:${String(startParts[1]).padStart(2, '0')}`,
          endTime: `${endParts[0]}:${String(endParts[1]).padStart(2, '0')}`,
          reason: r.reason
        };
      });
      
      console.log(`Court ${courtId} on ${dateStr}: Reservation intervals (in minutes from midnight):`, 
        reservationIntervals.map(ri => `${ri.startTime}-${ri.endTime} (${ri.start}-${ri.end}) - ${ri.reason}`));
      
      for (const oh of openHours) {
        const [ohStartHour, ohStartMin] = oh.startTime.split(':').map(Number);
        const [ohEndHour, ohEndMin] = oh.endTime.split(':').map(Number);
        let blockStart = ohStartHour * 60 + ohStartMin;
        let blockEnd = ohEndHour * 60 + ohEndMin;
        
        console.log(`\nCourt ${courtId} on ${dateStr}: Examining open hour block ${oh.startTime}-${oh.endTime} (${blockStart}-${blockEnd} minutes)`);
        
        if (searchRange) {
          const originalStart = blockStart;
          const originalEnd = blockEnd;
          blockStart = Math.max(blockStart, searchRange.start);
          blockEnd = Math.min(blockEnd, searchRange.end);
          console.log(`Court ${courtId} on ${dateStr}: Adjusted block to match search range: ${originalStart}-${originalEnd} → ${blockStart}-${blockEnd}`);
        }
        
        if (blockStart >= blockEnd) {
          console.log(`Court ${courtId} on ${dateStr}: Open hour block ${oh.startTime}-${oh.endTime} (adjusted to [${blockStart}-${blockEnd}]) has no available time.`);
          continue;
        }
        
        let reservedIntervals = reservationIntervals.filter(interval => interval.end > blockStart && interval.start < blockEnd);
        reservedIntervals.sort((a, b) => a.start - b.start);
        console.log(`Court ${courtId} on ${dateStr}: Reserved intervals in this block:`, 
          reservedIntervals.map(ri => `${ri.startTime}-${ri.endTime} (${ri.start}-${ri.end}) - ${ri.reason}`));
        
        let freeIntervals = [];
        let current = blockStart;
        for (const interval of reservedIntervals) {
          if (interval.start > current) {
            freeIntervals.push({ 
              start: current, 
              end: Math.min(interval.start, blockEnd),
              startTime: `${Math.floor(current/60)}:${String(current%60).padStart(2, '0')}`,
              endTime: `${Math.floor(Math.min(interval.start, blockEnd)/60)}:${String(Math.min(interval.start, blockEnd)%60).padStart(2, '0')}`
            });
          }
          current = Math.max(current, interval.end);
          if (current >= blockEnd) break;
        }
        if (current < blockEnd) {
          freeIntervals.push({ 
            start: current, 
            end: blockEnd,
            startTime: `${Math.floor(current/60)}:${String(current%60).padStart(2, '0')}`,
            endTime: `${Math.floor(blockEnd/60)}:${String(blockEnd%60).padStart(2, '0')}`
          });
        }
        console.log(`Court ${courtId} on ${dateStr}: Computed free intervals in block:`, 
          freeIntervals.map(fi => `${fi.startTime}-${fi.endTime} (${fi.start}-${fi.end})`));
        
        for (const freeInterval of freeIntervals) {
          let candidate = roundUpToQuarter(freeInterval.start);
          if (candidate < freeInterval.start) {
            candidate = Math.ceil(freeInterval.start / 15) * 15;
          }
          
          const candidateTime = `${Math.floor(candidate/60)}:${String(candidate%60).padStart(2, '0')}`;
          const candidateEndTime = `${Math.floor((candidate+duration)/60)}:${String((candidate+duration)%60).padStart(2, '0')}`;
          
          console.log(`Court ${courtId} on ${dateStr}: Evaluating candidate ${candidateTime}-${candidateEndTime} (${candidate}-${candidate+duration}) in free interval ${freeInterval.startTime}-${freeInterval.endTime} (${freeInterval.start}-${freeInterval.end})`);
          
          if (candidate + duration <= freeInterval.end) {
            console.log(`Court ${courtId} on ${dateStr}: FOUND AVAILABLE SLOT from ${candidateTime} to ${candidateEndTime} (${candidate}-${candidate+duration})`);
            return true;
          } else {
            console.log(`Court ${courtId} on ${dateStr}: Candidate slot from ${candidateTime} to ${candidateEndTime} (${candidate}-${candidate+duration}) exceeds free interval (${freeInterval.start}-${freeInterval.end})`);
          }
        }
      }
      
      console.log(`Court ${courtId} on ${dateStr}: NO AVAILABLE continuous slot of ${duration} minutes found.`);
      return false;
    }
    
    console.log("\n==== CHECKING AVAILABILITY FOR EACH COURT ====");
    let availableCourts = [];
    
    if (useLocationFilter) {
      console.log(`Filtering courts by distance (${radius} miles from ${lat}, ${lng})...`);
      courts = courts.filter(court => {
        if (!court.latitude || !court.longitude) {
          console.log(`Court ${court.id} (${court.court_name}) has no coordinates, excluding from location filter.`);
          return false;
        }
        
        const distance = calculateDistance(
          parseFloat(lat), 
          parseFloat(lng), 
          court.latitude, 
          court.longitude
        );
        
        const withinRadius = distance <= parseFloat(radius);
        console.log(`Court ${court.id} (${court.court_name}) is ${distance.toFixed(2)} miles away - ${withinRadius ? 'WITHIN' : 'OUTSIDE'} radius.`);
        return withinRadius;
      });
      
      console.log(`After location filtering, ${courts.length} courts remain.`);
    }
    
    for (const court of courts) {
      console.log(`\nEvaluating court ${court.id} (${court.court_name})...`);
      let availableForCourt = false;
      for (const date of dateRange) {
        try {
          if (await isSlotAvailableForDate(date, court.id, durationMinutes, searchRange)) {
            console.log(`Court ${court.id} (${court.court_name}) IS AVAILABLE on ${date.toISOString().split('T')[0]}.`);
            availableForCourt = true;
            break;
          } else {
            console.log(`Court ${court.id} (${court.court_name}) is NOT available on ${date.toISOString().split('T')[0]}.`);
          }
        } catch (error) {
          console.error(`Error checking availability for court ${court.id} on ${date.toISOString()}:`, error);
        }
      }
      if (availableForCourt) {
        console.log(`Adding court ${court.id} (${court.court_name}) to available courts list.`);
        availableCourts.push(court);
      } else {
        console.log(`Court ${court.id} (${court.court_name}) has NO AVAILABILITY in the requested date range.`);
      }
    }
    console.log("\n==== AVAILABILITY CHECK COMPLETE ====");
    console.log(`Found ${availableCourts.length} available courts:`, availableCourts.map(c => `${c.id} (${c.court_name})`));
    
    return res.status(200).json({
      data: availableCourts,
      count: availableCourts.length
    });
  } catch (err) {
    console.error("Fatal error in /court/available endpoint:", err);
    return res.status(500).json({ message: "Failed to find available courts", error: err.message });
  }
});

// GET /court/:id - Fetch a single court by ID using the many-to-many relationship
router.get('/:id', async (req, res) => {
  try {
    if (req.params.id === 'available') {
      return res.status(400).json({ message: 'Invalid court id' });
    }
    const { id } = req.params;
    let court;
    try {
      court = await db('court')
        .join('org', 'court.org_id', 'org.id')
        .select('court.*', 'org.name as org_name')
        .where('court.id', id)
        .first();
    } catch (err) {
      console.error("Error querying court info:", err);
      return res.status(500).json({ message: "Error retrieving court info", error: err.message });
    }
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    let courtTypes;
    try {
      courtTypes = await db('court_court_type')
        .join('court_type', 'court_court_type.court_type_id', 'court_type.id')
        .select('court_type.id', 'court_type.name')
        .where('court_court_type.court_id', id);
    } catch (err) {
      console.error("Error retrieving court types:", err);
      return res.status(500).json({ message: "Error retrieving court types", error: err.message });
    }
    let openHours;
    try {
      openHours = await db('open_hour')
        .where('court_id', id)
        .orderBy('dayOfWeek')
        .orderBy('startTime');
    } catch (err) {
      console.error("Error retrieving open hours:", err);
      return res.status(500).json({ message: "Error retrieving open hours", error: err.message });
    }
    return res.status(200).json({
      ...court,
      court_types: courtTypes,
      open_hours: openHours
    });
  } catch (err) {
    console.error("Fatal error in GET /court/:id endpoint:", err);
    return res.status(500).json({ message: "Failed to fetch court", error: err.message });
  }
});

// POST /court
router.post('/', async (req, res) => {
  try {
    const courtData = {
      name: req.body.name,
      status: req.body.status,
      court_type_id: req.body.court_type_id,
      org_id: req.body.org_id,
      latitude: req.body.latitude,
      longitude: req.body.longitude
    };

    const validationErrors = validateCourtData(courtData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }

    const [orgExists, courtTypeExists] = await Promise.all([
      db('org').where('id', courtData.org_id).first(),
      courtData.court_type_id ? db('court_type').where('id', courtData.court_type_id).first() : true
    ]);

    if (!orgExists) {
      return res.status(400).json({ message: 'Organization does not exist' });
    }

    if (courtData.court_type_id && !courtTypeExists) {
      return res.status(400).json({ message: 'Court type does not exist' });
    }

    const [newCourt] = await db('court').insert(courtData).returning('*');
    res.status(201).json(newCourt);

  } catch (err) {
    console.error('Error creating court:', err);
    res.status(500).json({ message: 'Failed to create court', error: err.message });
  }
});

// PUT /court/:id
router.put('/:id', async (req, res) => {
  try {
    const courtData = {
      name: req.body.name,
      status: req.body.status,
      court_type_id: req.body.court_type_id,
      org_id: req.body.org_id,
      latitude: req.body.latitude,
      longitude: req.body.longitude
    };

    const validationErrors = validateCourtData(courtData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }

    const existingCourt = await db('court').where('id', req.params.id).first();
    if (!existingCourt) {
      return res.status(404).json({ message: 'Court not found' });
    }

    const [orgExists, courtTypeExists] = await Promise.all([
      db('org').where('id', courtData.org_id).first(),
      courtData.court_type_id ? db('court_type').where('id', courtData.court_type_id).first() : true
    ]);

    if (!orgExists) {
      return res.status(400).json({ message: 'Organization does not exist' });
    }

    if (courtData.court_type_id && !courtTypeExists) {
      return res.status(400).json({ message: 'Court type does not exist' });
    }

    const [updatedCourt] = await db('court')
      .where('id', req.params.id)
      .update(courtData)
      .returning('*');

    res.status(200).json(updatedCourt);

  } catch (err) {
    console.error('Error updating court:', err);
    res.status(500).json({ message: 'Failed to update court', error: err.message });
  }
});

// DELETE /court/:id
router.delete('/:id', async (req, res) => {
  try {
    const existingReservations = await db('reservation')
      .where('court_id', req.params.id)
      .first();

    if (existingReservations) {
      return res.status(400).json({ 
        message: 'Cannot delete court with existing reservations' 
      });
    }

    const deletedCount = await db('court')
      .where('id', req.params.id)
      .delete();

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Court not found' });
    }

    res.status(200).json({ message: 'Court deleted successfully' });

  } catch (err) {
    console.error('Error deleting court:', err);
    res.status(500).json({ message: 'Failed to delete court', error: err.message });
  }
});

// GET /court/:id/schedule - Get court schedule with available times and pricing
router.get('/:id/schedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.query;
    const user = req.user; 
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required (format: YYYY-MM-DD)' });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    let durationMinutes = null;
    if (time) {
      durationMinutes = parseInt(time);
      if (isNaN(durationMinutes) || durationMinutes <= 0) {
        return res.status(400).json({ message: 'Time must be a positive number in minutes' });
      }
    }
    
    const court = await db('court')
      .where('id', id)
      .first();
      
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    
    const pricing = await db('pricing')
      .where({
        'court_id': id,
        'member_type_id': user.member_type_id
      })
      .first();
    
    const pricePerHour = pricing ? pricing.price : null;
    
    const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay(); 
    
    const openHours = await db('open_hour')
      .where('court_id', id)
      .where('dayOfWeek', dayOfWeek);
    
    if (!openHours.length) {
      return res.status(200).json({
        court_id: id,
        date: date,
        price_per_hour: pricePerHour,
        open_hours: [],
        available_slots: [],
        available_start_times: []
      });
    }
    
    const formattedOpenHours = openHours.map(oh => ({
      day_of_week: oh.dayOfWeek,
      start_time: oh.startTime,
      end_time: oh.endTime
    }));
    
    const dateStr = dateObj.toISOString().split('T')[0]; 
    const startOfDayStr = `${dateStr} 00:00:00`;
    const endOfDayStr = `${dateStr} 23:59:59`;
    
    const reservations = await db('reservation')
      .where('court_id', id)
      .whereNot('status', 'Cancelled') 
      .andWhere(function() {
        this.where(function() {
          this.where('start', '>=', startOfDayStr)
              .andWhere('start', '<=', endOfDayStr);
        })
        .orWhere(function() {
          this.where('end', '>', startOfDayStr)
              .andWhere('end', '<=', endOfDayStr);
        })
        .orWhere(function() {
          this.where('start', '<', startOfDayStr)
              .andWhere('end', '>', endOfDayStr);
        });
      });
    
    const reservationIntervals = reservations.map(r => {
      const startParts = r.start.split(' ')[1].split(':').map(Number);
      const endParts = r.end.split(' ')[1].split(':').map(Number);
      
      return {
        start: startParts[0] * 60 + startParts[1],
        end: endParts[0] * 60 + endParts[1]
      };
    });
    
    const formatMinutesToTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };
    
    let availableSlots = [];
    let availableStartTimes = [];
    
    for (const oh of openHours) {
      const [ohStartHour, ohStartMin] = oh.startTime.split(':').map(Number);
      const [ohEndHour, ohEndMin] = oh.endTime.split(':').map(Number);
      
      const blockStart = ohStartHour * 60 + ohStartMin;
      const blockEnd = ohEndHour * 60 + ohEndMin;
      
      const blockReservations = reservationIntervals.filter(
        interval => interval.end > blockStart && interval.start < blockEnd
      ).sort((a, b) => a.start - b.start);
      
      let freeIntervals = [];
      let current = blockStart;
      
      for (const interval of blockReservations) {
        if (interval.start > current) {
          freeIntervals.push({ 
            start: current, 
            end: Math.min(interval.start, blockEnd)
          });
        }
        current = Math.max(current, interval.end);
        if (current >= blockEnd) break;
      }
      
      if (current < blockEnd) {
        freeIntervals.push({ 
          start: current, 
          end: blockEnd
        });
      }
      
      for (const interval of freeIntervals) {
        let slotStart = Math.ceil(interval.start / 15) * 15;
        let slotEnd = Math.floor(interval.end / 15) * 15;
        
        if (slotEnd > slotStart) {
          availableSlots.push({
            start_time: formatMinutesToTime(slotStart),
            end_time: formatMinutesToTime(slotEnd),
            duration_minutes: slotEnd - slotStart
          });
          
          if (durationMinutes) {
            const increment = durationMinutes % 30 === 0 ? 30 : 15;
            
            for (let startTime = slotStart; startTime + durationMinutes <= slotEnd; startTime += increment) {
              availableStartTimes.push(formatMinutesToTime(startTime));
            }
          }
        }
      }
    }
    
    if (!durationMinutes) {
      availableStartTimes = [];
    }
    
    return res.status(200).json({
      court_id: id,
      date: date,
      price_per_hour: pricePerHour,
      open_hours: formattedOpenHours,
      available_slots: availableSlots,
      available_start_times: availableStartTimes
    });
    
  } catch (err) {
    console.error('Error fetching court schedule:', err);
    res.status(500).json({ message: 'Failed to fetch court schedule', error: err.message });
  }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; 
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

module.exports = router;
