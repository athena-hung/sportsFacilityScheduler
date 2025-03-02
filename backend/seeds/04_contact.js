// backend/seeds/contact.js
exports.seed = function(knex) {
    return knex('contact').del()
      .then(function () {
        return knex('contact').insert([
          { firstName: 'John', lastName: 'Doe', org_id: 1 },
          { firstName: 'Jane', lastName: 'Smith', org_id: 1 }
        ]);
      });
  };