// backend/seeds/org.js
exports.seed = function(knex) {
    return knex('org').del() // Deletes ALL existing entries
      .then(function () {
        return knex('org').insert([
          { name: 'Organization A', street: '123 Main St', state: 'NY', zip: '10001', defaultCourtsPerDay: 5, phone: '123-456-7890' },
          { name: 'Organization B', street: '456 Elm St', state: 'CA', zip: '90001', defaultCourtsPerDay: 3, phone: '987-654-3210' }
        ]);
      });
  };