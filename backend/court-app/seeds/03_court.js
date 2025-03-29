// backend/seeds/court.js
exports.seed = function(knex) {
    return knex('court').del()
      .then(function () {
        return knex('court').insert([
          { 
            name: 'Court 1', 
            status: 'available', 
            org_id: 1, 
            street: '123 Main St', 
            state: 'CA', 
            zip: '90210',
            latitude: 34.0522,
            longitude: -118.2437
          },
          { 
            name: 'Court 2', 
            status: 'available', 
            org_id: 1, 
            street: '456 Elm St', 
            state: 'CA', 
            zip: '90210',
            latitude: 40.7128,
            longitude: -74.0060
          }
        ]);
      });
  };