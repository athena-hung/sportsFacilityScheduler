// backend/seeds/open_hour.js
exports.seed = function(knex) {
    return knex('open_hour').del()
      .then(function () {
        return knex('open_hour').insert([
          { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', court_id: 1, org_id: 1 },
          { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', court_id: 1, org_id: 1 }
        ]);
      });
  };