const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the Knex database connection

// New endpoint to get reservations with optional filters (GET /reservation?start=...&end=...&reason=...&courtId=...&personId=...)
router.get('/', async (req, res) => {
  const { start, end, reason, courtId, personId } = req.query;

  try {
    const query = db('reservation').where(true); // Start with a base query

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

    if (personId) {
      query.andWhere('person_id', personId);
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
  const { start, end, reason, notes, courtId, personId } = req.body;

  // Basic validation for required fields
  if (!start || !end || !courtId || !personId) {
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
      person_id: personId
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

module.exports = router; 