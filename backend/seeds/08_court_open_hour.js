// backend/seeds/court_open_hour.js
exports.seed = function(knex) {
    return knex('court_open_hour').del()
      .then(function () {
        return knex('court_open_hour').insert([
          { openHoursId: 1, court_id: 1 },
          { openHoursId: 2, court_id: 2 }
        ]);
      });
  };