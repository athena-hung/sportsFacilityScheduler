// backend/seeds/person.js
exports.seed = function(knex) {
    return knex('person').del()
      .then(function () {
        return knex('person').insert([
          { firstName: 'Alice', lastName: 'Johnson', address: '789 Oak St', birthdate: '1990-01-01', maxCourtsPerDay: 2, org_id: 1, member_type_id: 1 },
          { firstName: 'Bob', lastName: 'Williams', address: '321 Pine St', birthdate: '1985-05-05', maxCourtsPerDay: 3, org_id: 1, member_type_id: 2 }
        ]);
      });
  };