// backend/seeds/org.js
exports.seed = function(knex) {
    return knex('org').del() // Deletes ALL existing entries
      .then(function () {
        return knex('org').insert([
          { name: 'Organization A', address: '123 Main St', defaultCourtsPerDay: 5 },
          { name: 'Organization B', address: '456 Elm St', defaultCourtsPerDay: 3 }
        ]);
      });
  };