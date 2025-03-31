// backend/seeds/reservation.js
exports.seed = function(knex) {
  return knex('reservation').del()
    .then(function () {
      return knex('reservation').insert([
        { start: '2025-04-28 08:00', end: '2025-04-28 11:00', reason: 'Practice', notes: null, court_id: 1, user_id: 4, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 13:00', end: '2025-04-28 15:00', reason: 'Practice', notes: null, court_id: 1, user_id: 11, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-28 13:00', end: '2025-04-28 15:00', reason: 'Practice', notes: null, court_id: 2, user_id: 4, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-28 15:00', end: '2025-04-28 17:00', reason: 'Practice', notes: null, court_id: 3, user_id: 4, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-28 09:00', end: '2025-04-28 11:00', reason: 'Practice', notes: null, court_id: 4, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 12:00', end: '2025-04-28 14:00', reason: 'Practice', notes: null, court_id: 4, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 12:00', end: '2025-04-28 14:00', reason: 'Practice', notes: null, court_id: 4, user_id: 11, org_id: 1, status: 'Cancelled' },
        { start: '2025-04-28 15:00', end: '2025-04-28 16:30', reason: 'Practice', notes: null, court_id: 4, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 17:00', end: '2025-04-28 18:00', reason: 'Practice', notes: null, court_id: 4, user_id: 10, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-28 08:00', end: '2025-04-28 10:00', reason: 'Practice', notes: null, court_id: 5, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 10:00', end: '2025-04-28 12:00', reason: 'Practice', notes: null, court_id: 5, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 15:00', end: '2025-04-28 16:00', reason: 'Practice', notes: null, court_id: 5, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 18:00', end: '2025-04-28 19:00', reason: 'Practice', notes: null, court_id: 5, user_id: 10, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-28 10:00', end: '2025-04-28 12:00', reason: 'Practice', notes: null, court_id: 6, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 13:00', end: '2025-04-28 15:00', reason: 'Practice', notes: null, court_id: 6, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 16:00', end: '2025-04-28 17:00', reason: 'Practice', notes: null, court_id: 6, user_id: 10, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-28 12:00', end: '2025-04-28 13:30', reason: 'Practice', notes: null, court_id: 7, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 14:00', end: '2025-04-28 15:30', reason: 'Practice', notes: null, court_id: 7, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 15:30', end: '2025-04-28 17:00', reason: 'Practice', notes: null, court_id: 7, user_id: 12, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-28 10:00', end: '2025-04-28 12:00', reason: 'Practice', notes: null, court_id: 8, user_id: 2, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 13:00', end: '2025-04-28 15:00', reason: 'Practice', notes: null, court_id: 8, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 15:00', end: '2025-04-28 16:00', reason: 'Practice', notes: null, court_id: 8, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 16:00', end: '2025-04-28 17:00', reason: 'Practice', notes: null, court_id: 8, user_id: 10, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-28 08:00', end: '2025-04-28 10:00', reason: 'Practice', notes: null, court_id: 9, user_id: 2, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 10:00', end: '2025-04-28 12:00', reason: 'Practice', notes: null, court_id: 9, user_id: 2, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 12:00', end: '2025-04-28 14:00', reason: 'Practice', notes: null, court_id: 9, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 15:00', end: '2025-04-28 17:00', reason: 'Practice', notes: null, court_id: 9, user_id: 7, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-28 12:00', end: '2025-04-28 14:00', reason: 'Practice', notes: null, court_id: 10, user_id: 3, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 16:00', end: '2025-04-28 17:00', reason: 'Practice', notes: null, court_id: 10, user_id: 12, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-28 08:00', end: '2025-04-28 10:00', reason: 'Practice', notes: null, court_id: 11, user_id: 12, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-28 10:00', end: '2025-04-28 12:00', reason: 'Practice', notes: null, court_id: 11, user_id: 3, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-29 14:00', end: '2025-04-29 17:00', reason: 'Practice', notes: null, court_id: 1, user_id: 4, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-29 12:00', end: '2025-04-29 15:00', reason: 'Practice', notes: null, court_id: 2, user_id: 4, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 16:00', end: '2025-04-29 19:00', reason: 'Practice', notes: null, court_id: 2, user_id: 4, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-29 08:00', end: '2025-04-29 09:00', reason: 'Practice', notes: null, court_id: 3, user_id: 11, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-29 09:00', end: '2025-04-29 10:30', reason: 'Practice', notes: null, court_id: 4, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 12:00', end: '2025-04-29 13:30', reason: 'Practice', notes: null, court_id: 4, user_id: 2, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 15:00', end: '2025-04-29 16:30', reason: 'Practice', notes: null, court_id: 4, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 16:30', end: '2025-04-29 18:00', reason: 'Practice', notes: null, court_id: 4, user_id: 9, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 16:30', end: '2025-04-29 17:30', reason: 'Practice', notes: null, court_id: 4, user_id: 10, org_id: 1, status: 'Cancelled' },

        { start: '2025-04-29 08:00', end: '2025-04-29 10:00', reason: 'Practice', notes: null, court_id: 5, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 12:00', end: '2025-04-29 14:00', reason: 'Practice', notes: null, court_id: 5, user_id: 2, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 14:00', end: '2025-04-29 15:00', reason: 'Practice', notes: null, court_id: 5, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 19:00', end: '2025-04-29 20:00', reason: 'Practice', notes: null, court_id: 5, user_id: 6, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-29 09:00', end: '2025-04-29 11:00', reason: 'Practice', notes: null, court_id: 6, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 13:00', end: '2025-04-29 15:00', reason: 'Practice', notes: null, court_id: 6, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 15:30', end: '2025-04-29 17:00', reason: 'Practice', notes: null, court_id: 6, user_id: 7, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-29 09:00', end: '2025-04-29 11:00', reason: 'Practice', notes: null, court_id: 7, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 12:00', end: '2025-04-29 14:00', reason: 'Practice', notes: null, court_id: 7, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 16:00', end: '2025-04-29 17:00', reason: 'Practice', notes: null, court_id: 7, user_id: 10, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-29 08:00', end: '2025-04-29 09:00', reason: 'Practice', notes: null, court_id: 8, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 08:00', end: '2025-04-29 10:00', reason: 'Practice', notes: null, court_id: 8, user_id: 1, org_id: 1, status: 'Cancelled' },
        { start: '2025-04-29 11:00', end: '2025-04-29 13:00', reason: 'Practice', notes: null, court_id: 8, user_id: 2, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 13:00', end: '2025-04-29 15:00', reason: 'Practice', notes: null, court_id: 8, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 15:00', end: '2025-04-29 16:00', reason: 'Practice', notes: null, court_id: 8, user_id: 6, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-29 10:00', end: '2025-04-29 12:00', reason: 'Practice', notes: null, court_id: 9, user_id: 2, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 13:00', end: '2025-04-29 15:00', reason: 'Practice', notes: null, court_id: 9, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 15:00', end: '2025-04-29 16:00', reason: 'Practice', notes: null, court_id: 9, user_id: 10, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-29 15:00', end: '2025-04-29 17:00', reason: 'Practice', notes: null, court_id: 10, user_id: 5, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-29 08:00', end: '2025-04-29 10:00', reason: 'Practice', notes: null, court_id: 11, user_id: 12, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-29 14:00', end: '2025-04-29 16:00', reason: 'Practice', notes: null, court_id: 11, user_id: 5, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-30 10:00', end: '2025-04-30 13:00', reason: 'Practice', notes: null, court_id: 1, user_id: 4, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 14:00', end: '2025-04-30 17:00', reason: 'Practice', notes: null, court_id: 1, user_id: 4, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-30 14:00', end: '2025-04-30 17:00', reason: 'Practice', notes: null, court_id: 2, user_id: 4, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 17:00', end: '2025-04-30 19:00', reason: 'Practice', notes: null, court_id: 2, user_id: 4, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-30 11:00', end: '2025-04-30 13:00', reason: 'Practice', notes: null, court_id: 3, user_id: 4, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 15:00', end: '2025-04-30 17:00', reason: 'Practice', notes: null, court_id: 3, user_id: 11, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-30 10:00', end: '2025-04-30 12:00', reason: 'Practice', notes: null, court_id: 4, user_id: 10, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 13:00', end: '2025-04-30 15:00', reason: 'Practice', notes: null, court_id: 4, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 15:00', end: '2025-04-30 17:00', reason: 'Practice', notes: null, court_id: 4, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 19:00', end: '2025-04-30 20:00', reason: 'Practice', notes: null, court_id: 4, user_id: 7, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-30 09:00', end: '2025-04-30 10:00', reason: 'Practice', notes: null, court_id: 5, user_id: 10, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 14:00', end: '2025-04-30 16:00', reason: 'Practice', notes: null, court_id: 5, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 16:00', end: '2025-04-30 18:00', reason: 'Practice', notes: null, court_id: 5, user_id: 6, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-30 11:00', end: '2025-04-30 12:30', reason: 'Practice', notes: null, court_id: 6, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 15:00', end: '2025-04-30 17:00', reason: 'Practice', notes: null, court_id: 6, user_id: 7, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-30 09:00', end: '2025-04-30 10:00', reason: 'Practice', notes: null, court_id: 7, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 11:00', end: '2025-04-30 13:00', reason: 'Practice', notes: null, court_id: 7, user_id: 2, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 14:00', end: '2025-04-30 16:00', reason: 'Practice', notes: null, court_id: 7, user_id: 6, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-30 08:00', end: '2025-04-30 10:00', reason: 'Practice', notes: null, court_id: 8, user_id: 10, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 10:00', end: '2025-04-30 12:00', reason: 'Practice', notes: null, court_id: 8, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 13:00', end: '2025-04-30 14:30', reason: 'Practice', notes: null, court_id: 8, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 15:00', end: '2025-04-30 17:00', reason: 'Practice', notes: null, court_id: 8, user_id: 7, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-30 09:00', end: '2025-04-30 11:00', reason: 'Practice', notes: null, court_id: 9, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 11:00', end: '2025-04-30 12:30', reason: 'Practice', notes: null, court_id: 9, user_id: 2, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 14:00', end: '2025-04-30 16:00', reason: 'Practice', notes: null, court_id: 9, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 16:00', end: '2025-04-30 17:00', reason: 'Practice', notes: null, court_id: 9, user_id: 6, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-30 13:00', end: '2025-04-30 15:00', reason: 'Practice', notes: null, court_id: 10, user_id: 3, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 15:00', end: '2025-04-30 17:00', reason: 'Practice', notes: null, court_id: 10, user_id: 3, org_id: 1, status: 'Confirmed' },

        { start: '2025-04-30 12:00', end: '2025-04-30 14:00', reason: 'Practice', notes: null, court_id: 11, user_id: 12, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 14:00', end: '2025-04-30 16:00', reason: 'Practice', notes: null, court_id: 11, user_id: 12, org_id: 1, status: 'Confirmed' },
        { start: '2025-04-30 16:00', end: '2025-04-30 17:00', reason: 'Practice', notes: null, court_id: 11, user_id: 12, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-01 12:00', end: '2025-05-01 15:00', reason: 'Practice', notes: null, court_id: 1, user_id: 4, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-01 15:00', end: '2025-05-01 17:00', reason: 'Practice', notes: null, court_id: 1, user_id: 4, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-01 14:00', end: '2025-05-01 17:00', reason: 'Practice', notes: null, court_id: 3, user_id: 11, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-01 08:00', end: '2025-05-01 10:00', reason: 'Practice', notes: null, court_id: 4, user_id: 10, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-01 11:00', end: '2025-05-01 13:00', reason: 'Practice', notes: null, court_id: 4, user_id: 10, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-01 15:00', end: '2025-05-01 17:00', reason: 'Practice', notes: null, court_id: 4, user_id: 2, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-01 15:00', end: '2025-05-01 19:00', reason: 'Practice', notes: null, court_id: 4, user_id: 1, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-01 10:00', end: '2025-05-01 11:00', reason: 'Practice', notes: null, court_id: 5, user_id: 10, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-01 12:00', end: '2025-05-01 14:00', reason: 'Practice', notes: null, court_id: 5, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-01 15:00', end: '2025-05-01 17:00', reason: 'Practice', notes: null, court_id: 5, user_id: 2, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-01 17:00', end: '2025-05-01 19:00', reason: 'Practice', notes: null, court_id: 5, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-01 19:00', end: '2025-05-01 20:00', reason: 'Practice', notes: null, court_id: 5, user_id: 1, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-01 12:00', end: '2025-05-01 14:00', reason: 'Practice', notes: null, court_id: 6, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-01 14:00', end: '2025-05-01 16:00', reason: 'Practice', notes: null, court_id: 6, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-01 16:00', end: '2025-05-01 17:00', reason: 'Practice', notes: null, court_id: 6, user_id: 7, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-01 09:00', end: '2025-05-01 11:00', reason: 'Practice', notes: null, court_id: 7, user_id: 10, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-01 14:00', end: '2025-05-01 15:00', reason: 'Practice', notes: null, court_id: 7, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-01 15:00', end: '2025-05-01 17:00', reason: 'Practice', notes: null, court_id: 7, user_id: 2, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-01 10:00', end: '2025-05-01 12:00', reason: 'Practice', notes: null, court_id: 8, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-01 13:30', end: '2025-05-01 15:30', reason: 'Practice', notes: null, court_id: 8, user_id: 2, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-01 15:30', end: '2025-05-01 17:00', reason: 'Practice', notes: null, court_id: 8, user_id: 1, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-01 12:00', end: '2025-05-01 14:00', reason: 'Practice', notes: null, court_id: 9, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-01 14:00', end: '2025-05-01 15:00', reason: 'Practice', notes: null, court_id: 9, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-01 15:00', end: '2025-05-01 17:00', reason: 'Practice', notes: null, court_id: 9, user_id: 7, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-01 09:00', end: '2025-05-01 10:00', reason: 'Practice', notes: null, court_id: 10, user_id: 5, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-01 13:00', end: '2025-05-01 15:00', reason: 'Practice', notes: null, court_id: 10, user_id: 5, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-01 15:00', end: '2025-05-01 17:00', reason: 'Practice', notes: null, court_id: 11, user_id: 6, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-02 14:00', end: '2025-05-02 15:00', reason: 'Practice', notes: null, court_id: 1, user_id: 4, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-02 14:00', end: '2025-05-02 15:00', reason: 'Practice', notes: null, court_id: 2, user_id: 4, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 15:00', end: '2025-05-02 17:00', reason: 'Practice', notes: null, court_id: 2, user_id: 4, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-02 08:00', end: '2025-05-02 11:00', reason: 'Practice', notes: null, court_id: 3, user_id: 4, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-02 10:00', end: '2025-05-02 11:00', reason: 'Practice', notes: null, court_id: 4, user_id: 10, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 14:00', end: '2025-05-02 15:00', reason: 'Practice', notes: null, court_id: 4, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 15:00', end: '2025-05-02 17:00', reason: 'Practice', notes: null, court_id: 4, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 17:00', end: '2025-05-02 18:00', reason: 'Practice', notes: null, court_id: 4, user_id: 6, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-02 08:00', end: '2025-05-02 10:00', reason: 'Practice', notes: null, court_id: 5, user_id: 10, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 12:00', end: '2025-05-02 14:00', reason: 'Practice', notes: null, court_id: 5, user_id: 2, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 14:00', end: '2025-05-02 16:00', reason: 'Practice', notes: null, court_id: 5, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 16:00', end: '2025-05-02 18:00', reason: 'Practice', notes: null, court_id: 5, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 18:00', end: '2025-05-02 20:00', reason: 'Practice', notes: null, court_id: 5, user_id: 6, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-02 08:00', end: '2025-05-02 10:00', reason: 'Practice', notes: null, court_id: 6, user_id: 2, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 11:00', end: '2025-05-02 12:00', reason: 'Practice', notes: null, court_id: 6, user_id: 10, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 12:00', end: '2025-05-02 14:00', reason: 'Practice', notes: null, court_id: 6, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 15:00', end: '2025-05-02 16:00', reason: 'Practice', notes: null, court_id: 6, user_id: 9, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-02 10:00', end: '2025-05-02 12:00', reason: 'Practice', notes: null, court_id: 7, user_id: 10, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 12:00', end: '2025-05-02 14:00', reason: 'Practice', notes: null, court_id: 7, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 14:00', end: '2025-05-02 15:00', reason: 'Practice', notes: null, court_id: 7, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 16:00', end: '2025-05-02 17:00', reason: 'Practice', notes: null, court_id: 7, user_id: 7, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-02 12:00', end: '2025-05-02 14:00', reason: 'Practice', notes: null, court_id: 8, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 14:00', end: '2025-05-02 16:00', reason: 'Practice', notes: null, court_id: 8, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 16:00', end: '2025-05-02 17:00', reason: 'Practice', notes: null, court_id: 8, user_id: 7, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-02 09:00', end: '2025-05-02 11:00', reason: 'Practice', notes: null, court_id: 9, user_id: 2, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 11:00', end: '2025-05-02 12:00', reason: 'Practice', notes: null, court_id: 9, user_id: 2, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 12:00', end: '2025-05-02 14:00', reason: 'Practice', notes: null, court_id: 9, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 16:00', end: '2025-05-02 17:00', reason: 'Practice', notes: null, court_id: 9, user_id: 7, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-02 08:00', end: '2025-05-02 10:00', reason: 'Practice', notes: null, court_id: 10, user_id: 5, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-02 10:00', end: '2025-05-02 12:00', reason: 'Practice', notes: null, court_id: 10, user_id: 5, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-02 15:00', end: '2025-05-02 17:00', reason: 'Practice', notes: null, court_id: 11, user_id: 3, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-03 08:00', end: '2025-05-03 11:00', reason: 'Practice', notes: null, court_id: 1, user_id: 4, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 11:00', end: '2025-05-03 14:00', reason: 'Practice', notes: null, court_id: 1, user_id: 4, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-03 08:00', end: '2025-05-03 11:00', reason: 'Practice', notes: null, court_id: 2, user_id: 4, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 11:00', end: '2025-05-03 14:00', reason: 'Practice', notes: null, court_id: 2, user_id: 4, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-03 08:00', end: '2025-05-03 11:00', reason: 'Practice', notes: null, court_id: 3, user_id: 4, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 12:00', end: '2025-05-03 15:00', reason: 'Practice', notes: null, court_id: 3, user_id: 4, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-03 08:00', end: '2025-05-03 10:00', reason: 'Practice', notes: null, court_id: 4, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 12:00', end: '2025-05-03 13:30', reason: 'Practice', notes: null, court_id: 4, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 13:30', end: '2025-05-03 15:00', reason: 'Practice', notes: null, court_id: 4, user_id: 9, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 15:00', end: '2025-05-03 17:00', reason: 'Practice', notes: null, court_id: 4, user_id: 9, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-03 08:00', end: '2025-05-03 10:00', reason: 'Practice', notes: null, court_id: 5, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 10:00', end: '2025-05-03 12:00', reason: 'Practice', notes: null, court_id: 5, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 12:00', end: '2025-05-03 14:00', reason: 'Practice', notes: null, court_id: 5, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 16:00', end: '2025-05-03 17:00', reason: 'Practice', notes: null, court_id: 5, user_id: 7, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-03 08:00', end: '2025-05-03 09:00', reason: 'Practice', notes: null, court_id: 6, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 09:00', end: '2025-05-03 11:00', reason: 'Practice', notes: null, court_id: 6, user_id: 2, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 12:00', end: '2025-05-03 14:00', reason: 'Practice', notes: null, court_id: 6, user_id: 6, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 15:00', end: '2025-05-03 17:00', reason: 'Practice', notes: null, court_id: 6, user_id: 6, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-03 10:00', end: '2025-05-03 12:00', reason: 'Practice', notes: null, court_id: 7, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 13:00', end: '2025-05-03 15:00', reason: 'Practice', notes: null, court_id: 7, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 15:00', end: '2025-05-03 17:00', reason: 'Practice', notes: null, court_id: 7, user_id: 6, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-03 11:00', end: '2025-05-03 14:00', reason: 'Practice', notes: null, court_id: 8, user_id: 7, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 14:00', end: '2025-05-03 16:00', reason: 'Practice', notes: null, court_id: 8, user_id: 7, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-03 09:00', end: '2025-05-03 11:00', reason: 'Practice', notes: null, court_id: 9, user_id: 1, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 11:00', end: '2025-05-03 13:00', reason: 'Practice', notes: null, court_id: 9, user_id: 10, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 15:00', end: '2025-05-03 17:00', reason: 'Practice', notes: null, court_id: 9, user_id: 7, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-03 09:00', end: '2025-05-03 10:00', reason: 'Practice', notes: null, court_id: 10, user_id: 12, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 10:00', end: '2025-05-03 12:00', reason: 'Practice', notes: null, court_id: 10, user_id: 12, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 14:00', end: '2025-05-03 16:00', reason: 'Practice', notes: null, court_id: 10, user_id: 5, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 16:00', end: '2025-05-03 17:00', reason: 'Practice', notes: null, court_id: 10, user_id: 5, org_id: 1, status: 'Confirmed' },

        { start: '2025-05-03 08:00', end: '2025-05-03 11:00', reason: 'Practice', notes: null, court_id: 11, user_id: 5, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 10:00', end: '2025-05-03 12:00', reason: 'Practice', notes: null, court_id: 11, user_id: 5, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 12:00', end: '2025-05-03 14:00', reason: 'Practice', notes: null, court_id: 11, user_id: 5, org_id: 1, status: 'Confirmed' },
        { start: '2025-05-03 15:00', end: '2025-05-03 17:00', reason: 'Practice', notes: null, court_id: 11, user_id: 3, org_id: 1, status: 'Confirmed' }

      ]);
    });
};