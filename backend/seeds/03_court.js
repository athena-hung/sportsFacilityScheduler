// backend/seeds/court.js
exports.seed = function(knex) {
    return knex('court').del()
      .then(function () {
        return knex('court').insert([
          { name: 'Court 1', status: 'available', court_type_id: 1, org_id: 1 },
          { name: 'Court 2', status: 'available', court_type_id: 2, org_id: 1 }
        ]);
      });
  };