const db = require('../db'); // Import the Knex database connection

async function setupDatabaseTest() {
  try {
    // Create a new table
    await db.schema.createTableIfNotExists('test_table', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('Table created successfully.');

    // Insert sample data
    await db('test_table').insert([
      { name: 'Sample Data 1' },
      { name: 'Sample Data 2' },
      { name: 'Sample Data 3' }
    ]);
    console.log('Sample data inserted successfully.');

    // Query the data to verify insertion
    const result = await db('test_table').select('*');
    console.log('Data in test_table:', result);

  } catch (err) {
    console.error('Error executing queries:', err);
  } finally {
    // Delete the table
    await db.schema.dropTableIfExists('test_table');
    console.log('Table deleted successfully.');
  }
}

// Run the setup function
setupDatabaseTest().catch(err => console.error('Setup failed:', err)); 