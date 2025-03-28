const knex = require('knex');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

// Set up Knex.js connection for PostgreSQL
const db = knex({
  client: 'pg',
  connection: config,
});

module.exports = db; 