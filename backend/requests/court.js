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

// GET /court/:id
router.get('/:id', async (req, res) => {
  try {
    const court = await db('court')
      .select(
        'court.*',
        'court_type.name as court_type_name',
        'org.name as org_name'
      )
      .leftJoin('court_type', 'court.court_type_id', 'court_type.id')
      .leftJoin('org', 'court.org_id', 'org.id')
      .where('court.id', req.params.id)
      .first();

    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    res.status(200).json(court);
  } catch (err) {
    console.error('Error fetching court:', err);
    res.status(500).json({ message: 'Failed to fetch court', error: err.message });
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

// GET /courts/:id/schedule
router.get('/:id/schedule', async (req, res) => {
  try {
    const courtId = req.params.id;

    // Check if the court exists
    const court = await db('court').where('id', courtId).first();
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    // Fetch reservations for the court
    const reservations = await db('reservation')
      .where('court_id', courtId)
      .select('start', 'end');

    // Fetch open hours for the court
    const courtOpenHours = await db('court_open_hour')
      .where('court_id', courtId)
      .join('open_hour', 'court_open_hour.openHoursId', 'open_hour.id')
      .select('open_hour.dayOfWeek', 'open_hour.startTime', 'open_hour.endTime');

    const availableSlots = [];
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // Get the current day of the week (0-6)

    // Iterate through the court's open hours
    courtOpenHours.forEach(openHour => {
      if (openHour.dayOfWeek === currentDay) {
        const scheduleStart = new Date();
        const [startHour, startMinute] = openHour.startTime.split(':').map(Number);
        scheduleStart.setHours(startHour, startMinute, 0);

        const scheduleEnd = new Date();
        const [endHour, endMinute] = openHour.endTime.split(':').map(Number);
        scheduleEnd.setHours(endHour, endMinute, 0);

        let currentTime = new Date(scheduleStart);
        
        // Check for availability in the schedule
        while (currentTime < scheduleEnd) {
          const nextTime = new Date(currentTime);
          nextTime.setHours(currentTime.getHours() + 1); // 1-hour slots

          // Check if the current time slot overlaps with any reservations
          const isReserved = reservations.some(reservation => {
            const reservationStart = new Date(reservation.start);
            const reservationEnd = new Date(reservation.end);
            return (currentTime < reservationEnd && nextTime > reservationStart);
          });

          if (!isReserved) {
            availableSlots.push({
              start: currentTime.toISOString(),
              end: nextTime.toISOString()
            });
          }

          currentTime = nextTime; // Move to the next hour
        }
      }
    });

    // Check for availability in the schedule
    while (currentTime < scheduleEnd) {
      const nextTime = new Date(currentTime);
      nextTime.setHours(currentTime.getHours() + 1); // 1-hour slots

      // Check if the current time slot overlaps with any reservations
      const isReserved = reservations.some(reservation => {
        const reservationStart = new Date(reservation.start);
        const reservationEnd = new Date(reservation.end);
        return (currentTime < reservationEnd && nextTime > reservationStart);
      });

      if (!isReserved) {
        availableSlots.push({
          start: currentTime.toISOString(),
          end: nextTime.toISOString()
        });
      }

      currentTime = nextTime; // Move to the next hour
    }

    res.status(200).json({
      courtId,
      availableSlots
    });

  } catch (err) {
    console.error('Error fetching court schedule:', err);
    res.status(500).json({ message: 'Failed to fetch court schedule', error: err.message });
  }
});

module.exports = router;
