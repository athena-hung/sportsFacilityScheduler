const express = require('express');
const router = express.Router();
const db = require('../db');

// Validation constants
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

    // Use authenticated user's org_id if available and no org_id was specified in query
    let effectiveOrgId = org_id;
    if (!effectiveOrgId && req.user && req.user.org_id) {
      effectiveOrgId = req.user.org_id;
      console.log(`Using authenticated user's org_id: ${effectiveOrgId}`);
    }

    // Validate and adjust pagination parameters
    const pageSize = Math.min(parseInt(limit) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const currentPage = Math.max(parseInt(page) || 1, 1);
    const offset = (currentPage - 1) * pageSize;

    // Build query
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

    // Get total count for pagination
    const [{ count }] = await query.clone().count();

    // Apply sorting and pagination
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
      sport,      // Required – maps to court_type name
      start_date, // Required – format: YYYY-MM-DD
      end_date,   // Required – format: YYYY-MM-DD
      time,       // Optional – duration in minutes (e.g., 30, 60, 90)
      time_start, // Optional – format: HH:MM (24hr) – lower bound of candidate slot
      time_end,   // Optional – format: HH:MM (24hr) – upper bound of candidate slot
      lat,        // Optional – latitude (for distance filtering)
      lng,        // Optional – longitude (for distance filtering)
      radius = 25,// Optional – search radius in miles (default: 25)
      zip,        // Optional – zip code filter
      org_id      // Optional – organization filter
    } = req.query;
    
    // Use authenticated user's org_id if available and no org_id was specified in query
    let effectiveOrgId = org_id;
    if (!effectiveOrgId && req.user && req.user.org_id) {
      effectiveOrgId = req.user.org_id;
      console.log(`Using authenticated user's org_id: ${effectiveOrgId}`);
    }
    
    // Validate required parameters.
    if (!sport) {
      return res.status(400).json({ message: 'Sport type (court_type) is required' });
    }
    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'Both start_date and end_date are required' });
    }
    
    // Validate and convert dates.
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }
    if (startDateObj > endDateObj) {
      return res.status(400).json({ message: 'start_date must be before or equal to end_date' });
    }
    
    // Validate requested duration (default is 60 minutes).
    let durationMinutes = 60;
    if (time) {
      durationMinutes = parseInt(time);
      if (isNaN(durationMinutes) || durationMinutes <= 0) {
        return res.status(400).json({ message: 'Time (duration) must be a positive number in minutes' });
      }
    }
    console.log(`Requested duration: ${durationMinutes} minutes`);
    
    // Validate and convert the optional time range.
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
    // Use these as search-range constraints if provided.
    const searchRange = (timeStartMinutes !== null && timeEndMinutes !== null)
      ? { start: timeStartMinutes, end: timeEndMinutes }
      : null;
    
    // Validate location parameters if provided
    let useLocationFilter = false;
    if (lat && lng) {
      if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
        return res.status(400).json({ message: 'Invalid latitude or longitude format' });
      }
      useLocationFilter = true;
      console.log(`Location filter: ${lat}, ${lng} with radius ${radius} miles`);
    }
    
    // STEP 1: Get matching court types based on the "sport" filter.
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
    
    // STEP 2: Query courts using the junction table (do NOT reference any non-existent court.court_type_id).
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
    
    // STEP 3: Create a date range array from start_date to end_date.
    const dateRange = [];
    let currentDate = new Date(startDateObj);
    while (currentDate <= endDateObj) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    console.log("Date range:", dateRange.map(d => d.toISOString().split('T')[0]));
    
    // Helper function to calculate distance between two points using Haversine formula
    function calculateDistance(lat1, lon1, lat2, lon2) {
      if (!lat1 || !lon1 || !lat2 || !lon2) {
        return Number.MAX_VALUE; // Return a large value if coordinates are missing
      }
      
      const R = 3958.8; // Earth's radius in miles
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
    
    // Helper function to round up to the nearest quarter hour.
    function roundUpToQuarter(minutes) {
      return Math.ceil(minutes / 15) * 15;
    }
    
    // Helper function to check if a court has an available slot on a specific date.
    async function isSlotAvailableForDate(date, courtId, duration, searchRange = null) {
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      console.log(`\nChecking availability for Court ${courtId} on ${dateStr}...`);
      
      // Get the day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Convert Sunday from 0 to 7
      
      // Retrieve open hours for this court on this day of week.
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
      
      // Format date strings for database comparison
      const startOfDayStr = `${dateStr} 00:00:00`;
      const endOfDayStr = `${dateStr} 23:59:59`;
      
      // Retrieve all reservations for this court on the given day.
      let reservations;
      try {
        reservations = await db('reservation')
          .where('court_id', courtId)
          .where('status', 'Confirmed')
          .whereNot('status', 'Cancelled') // Explicitly exclude cancelled reservations
          .andWhere(function() {
            this.where(function() {
              // Reservation starts during the day
              this.where('start', '>=', startOfDayStr)
                  .andWhere('start', '<=', endOfDayStr);
            })
            .orWhere(function() {
              // Reservation ends during the day
              this.where('end', '>', startOfDayStr)
                  .andWhere('end', '<=', endOfDayStr);
            })
            .orWhere(function() {
              // Reservation spans the entire day
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
      
      // Convert reservation times to minutes from midnight for easier comparison.
      const reservationIntervals = reservations.map(r => {
        // Extract time parts from the string dates (format: '2025-05-05 08:00')
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
      
      // For each open hour block, check if there's a continuous block of availability.
      for (const oh of openHours) {
        const [ohStartHour, ohStartMin] = oh.startTime.split(':').map(Number);
        const [ohEndHour, ohEndMin] = oh.endTime.split(':').map(Number);
        let blockStart = ohStartHour * 60 + ohStartMin;
        let blockEnd = ohEndHour * 60 + ohEndMin;
        
        console.log(`\nCourt ${courtId} on ${dateStr}: Examining open hour block ${oh.startTime}-${oh.endTime} (${blockStart}-${blockEnd} minutes)`);
        
        // If searchRange is provided, intersect the open hour block with it.
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
        
        // Filter reservations to those overlapping with the current block.
        let reservedIntervals = reservationIntervals.filter(interval => interval.end > blockStart && interval.start < blockEnd);
        reservedIntervals.sort((a, b) => a.start - b.start);
        console.log(`Court ${courtId} on ${dateStr}: Reserved intervals in this block:`, 
          reservedIntervals.map(ri => `${ri.startTime}-${ri.endTime} (${ri.start}-${ri.end}) - ${ri.reason}`));
        
        // Compute free intervals by subtracting reserved intervals within the block.
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
        
        // Check each free interval for a candidate slot that is at least 'duration' minutes long.
        for (const freeInterval of freeIntervals) {
          let candidate = roundUpToQuarter(freeInterval.start);
          // Ensure candidate does not start before the free interval.
          if (candidate < freeInterval.start) {
            candidate = Math.ceil(freeInterval.start / 15) * 15;
          }
          
          const candidateTime = `${Math.floor(candidate/60)}:${String(candidate%60).padStart(2, '0')}`;
          const candidateEndTime = `${Math.floor((candidate+duration)/60)}:${String((candidate+duration)%60).padStart(2, '0')}`;
          
          console.log(`Court ${courtId} on ${dateStr}: Evaluating candidate ${candidateTime}-${candidateEndTime} (${candidate}-${candidate+duration}) in free interval ${freeInterval.startTime}-${freeInterval.endTime} (${freeInterval.start}-${freeInterval.end})`);
          
          if (candidate + duration <= freeInterval.end) {
            console.log(`Court ${courtId} on ${dateStr}: ✅ FOUND AVAILABLE SLOT from ${candidateTime} to ${candidateEndTime} (${candidate}-${candidate+duration})`);
            return true;
          } else {
            console.log(`Court ${courtId} on ${dateStr}: ❌ Candidate slot from ${candidateTime} to ${candidateEndTime} (${candidate}-${candidate+duration}) exceeds free interval (${freeInterval.start}-${freeInterval.end})`);
          }
        }
      }
      
      console.log(`Court ${courtId} on ${dateStr}: ❌ NO AVAILABLE continuous slot of ${duration} minutes found.`);
      return false;
    }
    
    // STEP 4: For each court, check each day in the specified date range for availability.
    console.log("\n==== CHECKING AVAILABILITY FOR EACH COURT ====");
    let availableCourts = [];
    
    // Apply location filtering if lat/lng are provided
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
            console.log(`✅ Court ${court.id} (${court.court_name}) IS AVAILABLE on ${date.toISOString().split('T')[0]}.`);
            availableForCourt = true;
            break;
          } else {
            console.log(`❌ Court ${court.id} (${court.court_name}) is NOT available on ${date.toISOString().split('T')[0]}.`);
          }
        } catch (error) {
          console.error(`Error checking availability for court ${court.id} on ${date.toISOString()}:`, error);
        }
      }
      if (availableForCourt) {
        console.log(`✅ Adding court ${court.id} (${court.court_name}) to available courts list.`);
        availableCourts.push(court);
      } else {
        console.log(`❌ Court ${court.id} (${court.court_name}) has NO AVAILABILITY in the requested date range.`);
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
    // Prevent accidental capture of the word "available"
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

    // Validate input
    const validationErrors = validateCourtData(courtData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }

    // Verify foreign keys exist
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

    // Validate input
    const validationErrors = validateCourtData(courtData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }

    // Check if court exists
    const existingCourt = await db('court').where('id', req.params.id).first();
    if (!existingCourt) {
      return res.status(404).json({ message: 'Court not found' });
    }

    // Verify foreign keys exist
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
    // Check for existing reservations
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
    const user = req.user; // Get authenticated user from JWT
    
    // Validate required parameters
    if (!date) {
      return res.status(400).json({ message: 'Date is required (format: YYYY-MM-DD)' });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    // Validate time parameter if provided
    let durationMinutes = null;
    if (time) {
      durationMinutes = parseInt(time);
      if (isNaN(durationMinutes) || durationMinutes <= 0) {
        return res.status(400).json({ message: 'Time must be a positive number in minutes' });
      }
    }
    
    // Check if court exists
    const court = await db('court')
      .where('id', id)
      .first();
      
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    
    // Get pricing for this court and user's member type
    const pricing = await db('pricing')
      .where({
        'court_id': id,
        'member_type_id': user.member_type_id
      })
      .first();
    
    const pricePerHour = pricing ? pricing.price : null;
    
    // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay(); // Convert Sunday from 0 to 7
    
    // Get open hours for this court on this day
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
    
    // Format open hours for response
    const formattedOpenHours = openHours.map(oh => ({
      day_of_week: oh.dayOfWeek,
      start_time: oh.startTime,
      end_time: oh.endTime
    }));
    
    // Format date strings for database comparison
    const dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    const startOfDayStr = `${dateStr} 00:00:00`;
    const endOfDayStr = `${dateStr} 23:59:59`;
    
    // Get all reservations for this court on the given day
    const reservations = await db('reservation')
      .where('court_id', id)
      .whereNot('status', 'Cancelled') // Explicitly exclude cancelled reservations
      .andWhere(function() {
        this.where(function() {
          // Reservation starts during the day
          this.where('start', '>=', startOfDayStr)
              .andWhere('start', '<=', endOfDayStr);
        })
        .orWhere(function() {
          // Reservation ends during the day
          this.where('end', '>', startOfDayStr)
              .andWhere('end', '<=', endOfDayStr);
        })
        .orWhere(function() {
          // Reservation spans the entire day
          this.where('start', '<', startOfDayStr)
              .andWhere('end', '>', endOfDayStr);
        });
      });
    
    // Convert reservation times to minutes from midnight
    const reservationIntervals = reservations.map(r => {
      const startParts = r.start.split(' ')[1].split(':').map(Number);
      const endParts = r.end.split(' ')[1].split(':').map(Number);
      
      return {
        start: startParts[0] * 60 + startParts[1],
        end: endParts[0] * 60 + endParts[1]
      };
    });
    
    // Helper function to format minutes to HH:MM
    const formatMinutesToTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };
    
    // Calculate available slots
    let availableSlots = [];
    let availableStartTimes = [];
    
    // For each open hour block
    for (const oh of openHours) {
      const [ohStartHour, ohStartMin] = oh.startTime.split(':').map(Number);
      const [ohEndHour, ohEndMin] = oh.endTime.split(':').map(Number);
      
      const blockStart = ohStartHour * 60 + ohStartMin;
      const blockEnd = ohEndHour * 60 + ohEndMin;
      
      // Filter reservations to those overlapping with the current block
      const blockReservations = reservationIntervals.filter(
        interval => interval.end > blockStart && interval.start < blockEnd
      ).sort((a, b) => a.start - b.start);
      
      // Compute free intervals by subtracting reserved intervals
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
      
      // Add the free intervals directly as available slots
      for (const interval of freeIntervals) {
        // Round start time up to the next 15-minute mark
        let slotStart = Math.ceil(interval.start / 15) * 15;
        // Round end time down to the previous 15-minute mark
        let slotEnd = Math.floor(interval.end / 15) * 15;
        
        // Only add if there's at least 15 minutes available
        if (slotEnd > slotStart) {
          availableSlots.push({
            start_time: formatMinutesToTime(slotStart),
            end_time: formatMinutesToTime(slotEnd),
            duration_minutes: slotEnd - slotStart
          });
          
          // If duration is specified, check for possible start times
          if (durationMinutes) {
            // Determine the increment based on duration
            const increment = durationMinutes % 30 === 0 ? 30 : 15;
            
            // Generate possible start times in appropriate increments
            for (let startTime = slotStart; startTime + durationMinutes <= slotEnd; startTime += increment) {
              availableStartTimes.push(formatMinutesToTime(startTime));
            }
          }
        }
      }
    }
    
    // If no duration specified, don't return available start times
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

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in miles
}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

module.exports = router;
