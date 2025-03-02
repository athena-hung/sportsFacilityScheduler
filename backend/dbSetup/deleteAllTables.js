const db = require('../db'); // Import the Knex database connection

// Function to drop all tables
async function dropAllTables() {
    try {
      // Get the list of all table names
      const tables = await db.raw(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
      );
  
      // Drop each table with CASCADE to remove dependencies
      for (const table of tables.rows) { // Iterate over the table names
        await db.raw(`DROP TABLE IF EXISTS ${table.table_name} CASCADE`);
        console.log(`Dropped table: ${table.table_name}`);
      }
    } catch (err) {
      console.error('Error dropping tables:', err);
    }
}
  
dropAllTables();