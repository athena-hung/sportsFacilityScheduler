const pool = require('../db'); 

async function setupDatabase() {
  try {
    await pool.query(`
      DROP TABLE IF EXISTS reservation CASCADE; -- Drop reservation table if it exists
    `);
    console.log('Existing tables dropped successfully.');

    // create res table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS reservation (
        id SERIAL PRIMARY KEY,
        "end" TIMESTAMP NOT NULL, -- Enclosed in double quotes to avoid syntax error
        start TIMESTAMP NOT NULL,
        reason TEXT,
        notes TEXT,
        court_id INT NOT NULL,
        person_id INT NOT NULL
      );
    `;
    await pool.query(createTableQuery);
    console.log('reservation table created successfully.');

    // test data
    const insertTestDataQuery = `
      INSERT INTO reservation (start, "end", reason, notes, court_id, person_id)
      VALUES
        (NOW(), NOW() + INTERVAL '1 hour', 'Test Reservation 1', 'Notes 1', 1, 1),
        (NOW() + INTERVAL '1 hour', NOW() + INTERVAL '2 hours', 'Test Reservation 2', 'Notes 2', 1, 2)
      ON CONFLICT DO NOTHING; -- Prevent duplicate entries
    `;
    await pool.query(insertTestDataQuery);
    console.log('Test data inserted successfully.');

  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    pool.end(); 
  }
}

setupDatabase(); 