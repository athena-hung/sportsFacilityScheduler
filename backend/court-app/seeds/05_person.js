// backend/seeds/person.js
const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('user').del();

    // Hash the password 'password123'
    const hashedPassword = await bcrypt.hash('password123', 10);

    return knex('user').insert([
      { firstName: 'Alice', lastName: 'Johnson', address: '789 Oak St', birthdate: '1990-01-01', maxCourtsPerDay: 5, email: 'alice@example.com', password: hashedPassword, org_id: 1, member_type_id: 1 },
      { firstName: 'Julie', lastName: 'Jones', address: '455 W 18th St', birthdate: '1999-08-16', maxCourtsPerDay: 5, email: 'julie@example.com', password: hashedPassword, org_id: 1, member_type_id: 1 },
      { firstName: 'Sam', lastName: 'Taylor', address: null, birthdate: null, maxCourtsPerDay: 5, email: 'sam@example.com', password: hashedPassword, org_id: 1, member_type_id: 1 },

      { firstName: 'Bob', lastName: 'Williams', address: '321 Pine St', birthdate: '1985-05-05', maxCourtsPerDay: 8, email: 'bob@example.com', password: hashedPassword, org_id: 1, member_type_id: 2 },
      { firstName: 'Linda', lastName: 'Miller', address: '687 Granville St', birthdate: '1978-12-08', maxCourtsPerDay: 8, email: 'linda@example.com', password: hashedPassword, org_id: 1, member_type_id: 2 },
      { firstName: 'Aaron', lastName: 'Davis', address: '222 Maple St', birthdate: null, maxCourtsPerDay: 8, email: 'aaron@example.com', password: hashedPassword, org_id: 1, member_type_id: 2 },
      { firstName: 'Callie', lastName: 'Thomas', address: '530 E 59th St', birthdate: null, maxCourtsPerDay: 8, email: 'callie@example.com', password: hashedPassword, org_id: 1, member_type_id: 2 },

      { firstName: 'John', lastName: 'Doe', address: null, birthdate: null, maxCourtsPerDay: 0, email: 'john@example.com', password: hashedPassword, org_id: 1, member_type_id: 3 },

      { firstName: 'Jane', lastName: 'Smith', address: null, birthdate: '2016-10-21', maxCourtsPerDay: 5, email: 'jane@example.com', password: hashedPassword, org_id: 1, member_type_id: 4 },

      { firstName: 'Annie', lastName: 'Mason', address: '121 Spruce St', birthdate: null, maxCourtsPerDay: 5, email: 'annie@example.com', password: hashedPassword, org_id: 1, member_type_id: 5 },
      { firstName: 'Alex', lastName: 'Martin', address: null, birthdate: '1965-02-18', maxCourtsPerDay: 5, email: 'alex@example.com', password: hashedPassword, org_id: 1, member_type_id: 5 },

      { firstName: 'Joe', lastName: 'Davidson', address: '899 Fir St', birthdate: '1953-02-18', maxCourtsPerDay: 5, email: 'joe@example.com', password: hashedPassword, org_id: 1, member_type_id: 6 }

    ]);
  };