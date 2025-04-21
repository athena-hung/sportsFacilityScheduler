const db = require('../db'); 

async function dropAllTables() {
    try {
      const tables = await db.raw(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
      );

      for (const table of tables.rows) {
        const tableName = table.table_name;
        const formattedTableName = tableName === 'user' ? `"user"` : tableName;
        await db.raw(`DROP TABLE IF EXISTS ${formattedTableName} CASCADE`);
        console.log(`Dropped table: ${tableName}`);
      }
    } catch (err) {
      console.error('Error dropping tables:', err);
    } finally {
      process.exit(); 
    }
}
  
dropAllTables();