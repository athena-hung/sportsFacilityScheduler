const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /court-type - Get all court types for the authenticated user's organization
router.get('/', async (req, res) => {
  try {
    // Get authenticated user from JWT
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Query court types for the user's organization
    const courtTypes = await db('court_type')
      .where('org_id', user.org_id)
      .select('name')
      .orderBy('name');

    // Extract just the names into an array of strings
    const courtTypeNames = courtTypes.map(type => type.name);

    res.status(200).json(courtTypeNames);

  } catch (err) {
    console.error('Error fetching court types:', err);
    res.status(500).json({ message: 'Failed to fetch court types', error: err.message });
  }
});

module.exports = router;
