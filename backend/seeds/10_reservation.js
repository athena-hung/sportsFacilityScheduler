// backend/seeds/reservation.js
exports.seed = function(knex) {
    return knex('reservation').del()
      .then(function () {
        return knex('reservation').insert([
          { start: '2023-01-01 10:00', end: '2023-01-01 11:00', reason: 'Practice', notes: 'Bring water', court_id: 1, person_id: 1 },
          { start: '2023-01-01 12:00', end: '2023-01-01 13:00', reason: 'Game', notes: 'Bring snacks', court_id: 2, person_id: 2 }
        ]);
      });
  };