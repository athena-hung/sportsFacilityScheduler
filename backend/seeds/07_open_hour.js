// backend/seeds/open_hour.js
exports.seed = function(knex) {
    return knex('open_hour').del()
      .then(function () {
        return knex('open_hour').insert([
          { dayOfWeek: 1, startTime: '08:00', endTime: '17:00' },
          { dayOfWeek: 2, startTime: '08:00', endTime: '17:00' }
        ]);
      });
  };