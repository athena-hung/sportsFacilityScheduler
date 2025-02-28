const pool = require('../db'); 

async function setupDatabaseTest() {
  const client = await pool.connect(); 
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table created successfully.');

    await client.query(`
      INSERT INTO test_table (name) VALUES
      ('Sample Data 1'),
      ('Sample Data 2'),
      ('Sample Data 3');
    `);
    console.log('Sample data inserted successfully.');

    const result = await client.query('SELECT * FROM test_table;');
    console.log('Data in test_table:', result.rows);

  } catch (err) {
    console.error('Error executing queries:', err);
  } finally {
    await client.query('DROP TABLE IF EXISTS test_table;');
    console.log('Table deleted successfully.');
    client.release(); 
  }
}

setupDatabaseTest().catch(err => console.error('Setup failed:', err)); 