const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the Knex database connection

// New endpoint to get reservations with optional filters (GET /reservation?start=...&end=...&reason=...&courtId=...&personId=...)
router.get('/', async (req, res) => {
  const { start, end, reason, courtId, personId, status } = req.query;
  const user = req.user;
  const memberType = await db('member_type').where({ id: user.member_type_id }).first();
  const isAdmin = memberType && memberType.type && memberType.type.toLowerCase() === 'admin';

  try {
    const query = db('reservation').where(true); // Start with a base query
    if (!isAdmin) {
      query.andWhere('user_id', user.id);
    } else if (personId) {
      query.andWhere('user_id', personId);
    }

    // If start date is provided, filter reservations that start on or after that date
    if (start) {
      const startDate = new Date(start);
      if (!isNaN(startDate.getTime())) {
        const dateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const startOfDayStr = `${dateStr} 00:00:00`;
        query.andWhere('start', '>=', startOfDayStr);
      }
    }

    // If end date is provided, filter reservations that end on or before that date
    if (end) {
      const endDate = new Date(end);
      if (!isNaN(endDate.getTime())) {
        const dateStr = endDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const endOfDayStr = `${dateStr} 23:59:59`;
        query.andWhere('end', '<=', endOfDayStr);
      }
    } else {
      // If no end date is provided, only show current and future reservations
      const currentDate = new Date();
      const currentDateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const currentTimeStr = currentDate.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
      const currentDateTimeStr = `${currentDateStr} ${currentTimeStr}`;
      query.andWhere('end', '>=', currentDateTimeStr);
    }

    if (reason) {
      query.andWhere('reason', 'like', `%${reason}%`);
    }

    if (courtId) {
      query.andWhere('court_id', courtId);
    }

    if (status) {
      query.andWhere('status', status);
    }

    const result = await query; // Execute the query

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Reservation creation endpoint (POST /reservation)
router.post('/', async (req, res) => {
  const { start, end, reason, notes, courtId, status, personId } = req.body;
  const user = req.user;
  const memberType = await db('member_type').where({ id: user.member_type_id }).first();
  const isAdmin = memberType && memberType.type && memberType.type.toLowerCase() === 'admin';

  // Basic validation for required fields
  if (!start || !end || !courtId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Validate that start time is before end time
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate >= endDate) {
    return res.status(400).json({ message: 'Start time must be before end time' });
  }

  try {
    // Get the user who will own this reservation
    const reservationUserId = (isAdmin && personId) ? personId : user.id;
    const reservationUser = await db('user').where({ id: reservationUserId }).first();
    if (!reservationUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if court exists
    const court = await db('court').where({ id: courtId }).first();
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    // Get court type to check maxReservationTime
    const courtTypes = await db('court_court_type')
      .join('court_type', 'court_court_type.court_type_id', 'court_type.id')
      .where('court_court_type.court_id', courtId)
      .select('court_type.*');
    
    if (!courtTypes || courtTypes.length === 0) {
      return res.status(404).json({ message: 'No court types found for this court' });
    }
    
    // Use the first court type's maxReservationTime for validation
    const courtType = courtTypes[0];

    // Calculate reservation duration in minutes
    const durationMinutes = Math.round((endDate - startDate) / (1000 * 60));

    // Check if reservation exceeds max allowed time
    if (durationMinutes > courtType.maxReservationTime) {
      return res.status(400).json({ 
        message: `Reservation exceeds maximum allowed time of ${courtType.maxReservationTime} minutes for this court type` 
      });
    }

    // --- Max Future Reservations Check for non-admins ---
    if (!isAdmin) {
      const activeReservationsCount = await db('reservation')
        .where({ user_id: req.user.id })
        .whereNot({ status: 'Cancelled' })
        .where('start', '>=', new Date().toISOString())
        .count('id as count')
        .first();

      if (parseInt(activeReservationsCount.count) >= req.user.maxCourtsPerDay) {
        return res.status(400).json({ 
          message: `User has reached the maximum limit of ${req.user.maxCourtsPerDay} future reservations` 
        });
      }
    }
    // --- End Max Future Reservations Check ---

    // --- Open Hours Validation Check ---
    // Retrieve open hours for the court on the day of the reservation.
    const dayOfWeek = startDate.getDay() === 0 ? 7 : startDate.getDay(); // Convert Sunday (0) to 7
    const openHours = await db('open_hour').where({ court_id: courtId, dayOfWeek });
    if (!openHours || openHours.length === 0) {
      return res.status(400).json({ message: "Court is closed on the selected day" });
    }

    // Convert requested times to minutes-from-midnight.
    const reqStartMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const reqEndMinutes = endDate.getHours() * 60 + endDate.getMinutes();

    let withinOpenHours = false;
    for (const oh of openHours) {
      const [ohStartHour, ohStartMin] = oh.startTime.split(':').map(Number);
      const [ohEndHour, ohEndMin]   = oh.endTime.split(':').map(Number);
      const ohStart = ohStartHour * 60 + ohStartMin;
      const ohEnd   = ohEndHour * 60 + ohEndMin;
      if (reqStartMinutes >= ohStart && reqEndMinutes <= ohEnd) {
        withinOpenHours = true;
        break;
      }
    }
    if (!withinOpenHours) {
      return res.status(400).json({ message: "Reservation time does not fall within the court's open hours" });
    }
    // --- End Open Hours Validation Check ---

    // --- Overlapping Reservation Check ---
    let reservations;
    try {
      // Extract the date portion from the requested start time (assumes a one-day reservation)
      const reqDateStr = startDate.toISOString().split('T')[0]; // e.g., "2025-05-05"
      const startOfDayStr = `${reqDateStr} 00:00:00`;
      const endOfDayStr = `${reqDateStr} 23:59:59`;

      reservations = await db('reservation')
        .where('court_id', courtId)
        .whereNot({ status: 'Cancelled' })
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
      console.error("Error retrieving reservations for overlap check:", err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    // Check for any overlap with existing reservations (using minutes-from-midnight).
    const hasOverlap = reservations.some(r => {
      const [rStartHour, rStartMin] = r.start.split(' ')[1].split(':').map(Number);
      const [rEndHour, rEndMin]     = r.end.split(' ')[1].split(':').map(Number);
      const reservationStartMinutes = rStartHour * 60 + rStartMin;
      const reservationEndMinutes   = rEndHour * 60 + rEndMin;
      return reqStartMinutes < reservationEndMinutes && reqEndMinutes > reservationStartMinutes;
    });

    if (hasOverlap) {
      return res.status(400).json({ message: 'Court is already reserved during the requested time' });
    }
    // --- End Overlapping Reservation Check ---

    // Calculate price for the reservation (if pricing is set)
    let price = 0;
    const pricing = await db('pricing')
      .where({
        'court_id': courtId,
        'member_type_id': reservationUser.member_type_id
      })
      .first();
    
    if (pricing && pricing.price) {
      // Convert price per hour to price for the duration
      price = (pricing.price / 60) * durationMinutes;
    }

    // Insert reservation into the database using Knex
    const [reservation] = await db('reservation').insert({
      start,
      end,
      reason: reason || null,
      notes: notes || null,
      court_id: courtId,
      user_id: reservationUserId,
      status: isAdmin ? (status || 'Confirmed') : 'Pending',
      price: price
    }).returning('*');

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Reservation update endpoint (PUT /reservation/:id)
// Use this to update/cancel a reservation
router.put('/:id', async (req, res) => {
  const reservationId = req.params.id;
  const { start, end, reason, notes, courtId, personId, status } = req.body;
  const user = req.user;
  const memberType = await db('member_type').where({ id: user.member_type_id }).first();
  const isAdmin = memberType && memberType.type && memberType.type.toLowerCase() === 'admin';

  try {
    const reservation = await db('reservation').where({ id: reservationId }).first();
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Non-admin users can only update their own reservations
    if (!isAdmin && reservation.user_id !== user.id) {
      return res.status(403).json({ message: 'You are not allowed to update this reservation' });
    }

    const newUserId = (isAdmin && personId) ? personId : user.id;

    // Build the update object dynamically
    const updatedData = {
      ...(start !== undefined && { start }),
      ...(end !== undefined && { end }),
      ...(reason !== undefined && { reason }),
      ...(notes !== undefined && { notes }),
      ...(courtId !== undefined && { court_id: courtId }),
      user_id: newUserId,
    };
    
    // Allow users to cancel their own reservations, but only admins can set other statuses
    if (status === 'Cancelled' || isAdmin) {
      updatedData.status = status || reservation.status;
    }

    const [updatedReservation] = await db('reservation')
      .where({ id: reservationId })
      .update(updatedData)
      .returning('*');

    res.status(200).json({
      message: 'Reservation updated successfully',
      reservation: updatedReservation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Payment confirmation endpoint (POST /reservation/confirm)
// This endpoint doesn't confirm that payment was actually recieved, it just takes a dummy payment amount and updates the reservation status to confirmed
// TODO: Add payment confirmation endpoint that actually confirms payment was received
router.post('/confirm', async (req, res) => {
  const { reservationId, paymentAmount } = req.body;
  const user = req.user;

  if (!reservationId || paymentAmount === undefined) {
    return res.status(400).json({ message: 'Missing required fields: reservationId and paymentAmount' });
  }

  try {
    // Find the reservation
    const reservation = await db('reservation').where({ id: reservationId }).first();
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user owns this reservation or is an admin
    const memberType = await db('member_type').where({ id: user.member_type_id }).first();
    const isAdmin = memberType && memberType.type && memberType.type.toLowerCase() === 'admin';
    
    if (!isAdmin && reservation.user_id !== user.id) {
      return res.status(403).json({ message: 'You are not authorized to confirm payment for this reservation' });
    }

    // Check if reservation is already confirmed or cancelled
    if (reservation.status === 'Confirmed') {
      return res.status(400).json({ message: 'This reservation is already confirmed, no payment needed' });
    }
    
    if (reservation.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot confirm payment for a cancelled reservation' });
    }

    // Validate payment amount
    if (parseFloat(paymentAmount) < parseFloat(reservation.price)) {
      return res.status(400).json({ 
        message: `Payment amount (${paymentAmount}) is less than the required price (${reservation.price})` 
      });
    }

    // Get current date and time for payment_date
    const paymentDate = new Date().toISOString();

    // Update reservation status to confirmed and record payment details
    const [updatedReservation] = await db('reservation')
      .where({ id: reservationId })
      .update({ 
        status: 'Confirmed',
        payment_amount: paymentAmount,
        payment_date: paymentDate
      })
      .returning('*');

    res.status(200).json({
      message: 'Payment confirmed and reservation status updated to Confirmed',
      reservation: updatedReservation
    });
  } catch (err) {
    console.error('Error confirming payment:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router; 