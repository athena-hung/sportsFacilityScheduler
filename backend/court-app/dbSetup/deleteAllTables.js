const db = require('../db'); // Import the Knex database connection

// Function to drop all tables
async function dropAllTables() {
    try {
      // Get the list of all table names from the public schema
      const tables = await db.raw(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
      );
  
      // Drop each table with CASCADE to remove dependencies.
      // For the "user" table (a reserved word), wrap the name in double quotes.
      for (const table of tables.rows) {
        const tableName = table.table_name;
        const formattedTableName = tableName === 'user' ? `"user"` : tableName;
        await db.raw(`DROP TABLE IF EXISTS ${formattedTableName} CASCADE`);
        console.log(`Dropped table: ${tableName}`);
      }
    } catch (err) {
      console.error('Error dropping tables:', err);
    } finally {
      process.exit(); // Ensure the process exits after dropping tables
    }
}
  
dropAllTables();