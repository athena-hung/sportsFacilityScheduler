// backend/seeds/person.js
const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('user').del();

    // Hash the password 'password123'
    const hashedPassword = await bcrypt.hash('password123', 10);

    return knex('user').insert([
      { firstName: 'Alice', lastName: 'Johnson', address: '789 Oak St', birthdate: '1990-01-01', maxCourtsPerDay: 2, email: 'alice@example.com', password: hashedPassword, org_id: 1, member_type_id: 1 },
      { firstName: 'Bob', lastName: 'Williams', address: '321 Pine St', birthdate: '1985-05-05', maxCourtsPerDay: 3, email: 'bob@example.com', password: hashedPassword, org_id: 1, member_type_id: 2 },
      { firstName: 'John', lastName: 'Doe', address: null, birthdate: null, maxCourtsPerDay: 0, email: 'john@example.com', password: hashedPassword, org_id: 1, member_type_id: 3 },
      { firstName: 'Jane', lastName: 'Smith', address: null, birthdate: null, maxCourtsPerDay: 0, email: 'jane@example.com', password: hashedPassword, org_id: 1, member_type_id: 3 }
    ]);
  };