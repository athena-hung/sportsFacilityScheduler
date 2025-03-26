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

    if (start) {
      query.andWhere('start', '>=', start);
    }

    if (end) {
      query.andWhere('end', '<=', end);
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
  const { start, end, reason, notes, courtId, personId, status } = req.body;
  const user = req.user;
  const memberType = await db('member_type').where({ id: user.member_type_id }).first();
  const isAdmin = memberType && memberType.type && memberType.type.toLowerCase() === 'admin';

  // Basic validation for required fields (personId is optional for admin)
  if (!start || !end || !courtId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Insert reservation into the database using Knex
    const [reservation] = await db('reservation').insert({
      start,
      end,
      reason: reason || null,
      notes: notes || null,
      court_id: courtId,
      user_id: (isAdmin && personId) ? personId : user.id,
      status: isAdmin ? (status || 'Confirmed') : 'Pending' // Default to Pending for non-admin users
    }).returning('*'); // Return the inserted reservation

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
      ...(isAdmin ? { status: status || reservation.status } : { status: reservation.status })
    };

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

module.exports = router; 