const express = require('express');
const router = express.Router();
const pool = require('../db'); 

// create new res
router.post('/', async (req, res) => {
  const { start, end, reason, notes, courtId, personId } = req.body;

  if (!start || !end || !courtId || !personId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = `
      INSERT INTO reservations (start, end, reason, notes, court_id, person_id)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;

    const values = [start, end, reason || null, notes || null, courtId, personId];
    const result = await pool.query(query, values);
    // console.log('Executing query:', query, 'with values:', values);
    const reservation = result.rows[0];

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// getter with date ranges
router.get('/', async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    let query = 'SELECT * FROM reservation WHERE TRUE'; // Base query
    const conditions = [];
    const values = [];
    let index = 1;

    if (startDate) {
      conditions.push(`start >= $${index}`);
      values.push(startDate);
    }

    if (endDate) {
      conditions.push(`end <= $${index}`);
      values.push(endDate);
    }

    const result = await pool.query(query, values);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// getter with res id
router.get('/id/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'SELECT * FROM reservation WHERE id = $1;';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router; 