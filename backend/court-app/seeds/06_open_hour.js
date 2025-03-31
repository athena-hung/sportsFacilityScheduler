// backend/seeds/open_hour.js
exports.seed = function(knex) {
  return knex('open_hour').del()
    .then(function () {
      return knex('open_hour').insert([
        { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', court_id: 1, org_id: 1 },
        { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', court_id: 1, org_id: 1 },
        { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', court_id: 1, org_id: 1 },
        { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', court_id: 1, org_id: 1 },
        { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', court_id: 1, org_id: 1 },
        { dayOfWeek: 6, startTime: '08:00', endTime: '17:00', court_id: 1, org_id: 1 },
        { dayOfWeek: 7, startTime: '08:00', endTime: '17:00', court_id: 1, org_id: 1 },

        { dayOfWeek: 1, startTime: '09:00', endTime: '19:00', court_id: 2, org_id: 1 },
        { dayOfWeek: 2, startTime: '09:00', endTime: '19:00', court_id: 2, org_id: 1 },
        { dayOfWeek: 3, startTime: '09:00', endTime: '19:00', court_id: 2, org_id: 1 },
        { dayOfWeek: 4, startTime: '09:00', endTime: '19:00', court_id: 2, org_id: 1 },
        { dayOfWeek: 5, startTime: '09:00', endTime: '19:00', court_id: 2, org_id: 1 },
        { dayOfWeek: 6, startTime: '09:00', endTime: '19:00', court_id: 2, org_id: 1 },
        { dayOfWeek: 7, startTime: '09:00', endTime: '19:00', court_id: 2, org_id: 1 },

        { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', court_id: 3, org_id: 1 },
        { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', court_id: 3, org_id: 1 },
        { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', court_id: 3, org_id: 1 },
        { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', court_id: 3, org_id: 1 },
        { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', court_id: 3, org_id: 1 },
        { dayOfWeek: 6, startTime: '08:00', endTime: '17:00', court_id: 3, org_id: 1 },
        { dayOfWeek: 7, startTime: '08:00', endTime: '17:00', court_id: 3, org_id: 1 },

        { dayOfWeek: 1, startTime: '08:00', endTime: '20:00', court_id: 4, org_id: 1 },
        { dayOfWeek: 2, startTime: '08:00', endTime: '20:00', court_id: 4, org_id: 1 },
        { dayOfWeek: 3, startTime: '08:00', endTime: '20:00', court_id: 4, org_id: 1 },
        { dayOfWeek: 4, startTime: '08:00', endTime: '20:00', court_id: 4, org_id: 1 },
        { dayOfWeek: 5, startTime: '08:00', endTime: '20:00', court_id: 4, org_id: 1 },
        { dayOfWeek: 6, startTime: '08:00', endTime: '20:00', court_id: 4, org_id: 1 },
        { dayOfWeek: 7, startTime: '08:00', endTime: '20:00', court_id: 4, org_id: 1 },

        { dayOfWeek: 1, startTime: '08:00', endTime: '20:00', court_id: 5, org_id: 1 },
        { dayOfWeek: 2, startTime: '08:00', endTime: '20:00', court_id: 5, org_id: 1 },
        { dayOfWeek: 3, startTime: '08:00', endTime: '20:00', court_id: 5, org_id: 1 },
        { dayOfWeek: 4, startTime: '08:00', endTime: '20:00', court_id: 5, org_id: 1 },
        { dayOfWeek: 5, startTime: '08:00', endTime: '20:00', court_id: 5, org_id: 1 },
        { dayOfWeek: 6, startTime: '08:00', endTime: '20:00', court_id: 5, org_id: 1 },
        { dayOfWeek: 7, startTime: '08:00', endTime: '20:00', court_id: 5, org_id: 1 },

        { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', court_id: 6, org_id: 1 },
        { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', court_id: 6, org_id: 1 },
        { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', court_id: 6, org_id: 1 },
        { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', court_id: 6, org_id: 1 },
        { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', court_id: 6, org_id: 1 },
        { dayOfWeek: 6, startTime: '08:00', endTime: '17:00', court_id: 6, org_id: 1 },
        { dayOfWeek: 7, startTime: '08:00', endTime: '17:00', court_id: 6, org_id: 1 },

        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', court_id: 7, org_id: 1 },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', court_id: 7, org_id: 1 },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', court_id: 7, org_id: 1 },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', court_id: 7, org_id: 1 },
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', court_id: 7, org_id: 1 },
        { dayOfWeek: 6, startTime: '10:00', endTime: '17:00', court_id: 7, org_id: 1 },
        { dayOfWeek: 7, startTime: '10:00', endTime: '17:00', court_id: 7, org_id: 1 },

        { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', court_id: 8, org_id: 1 },
        { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', court_id: 8, org_id: 1 },
        { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', court_id: 8, org_id: 1 },
        { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', court_id: 8, org_id: 1 },
        { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', court_id: 8, org_id: 1 },
        { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', court_id: 8, org_id: 1 },
        { dayOfWeek: 7, startTime: '10:00', endTime: '16:00', court_id: 8, org_id: 1 },

        { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', court_id: 9, org_id: 1 },
        { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', court_id: 9, org_id: 1 },
        { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', court_id: 9, org_id: 1 },
        { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', court_id: 9, org_id: 1 },
        { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', court_id: 9, org_id: 1 },
        { dayOfWeek: 6, startTime: '08:00', endTime: '17:00', court_id: 9, org_id: 1 },
        { dayOfWeek: 7, startTime: '08:00', endTime: '17:00', court_id: 9, org_id: 1 },

        { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', court_id: 10, org_id: 1 },
        { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', court_id: 10, org_id: 1 },
        { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', court_id: 10, org_id: 1 },
        { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', court_id: 10, org_id: 1 },
        { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', court_id: 10, org_id: 1 },
        { dayOfWeek: 6, startTime: '08:00', endTime: '17:00', court_id: 10, org_id: 1 },
        { dayOfWeek: 7, startTime: '08:00', endTime: '17:00', court_id: 10, org_id: 1 },
        
        { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', court_id: 11, org_id: 1 },
        { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', court_id: 11, org_id: 1 },
        { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', court_id: 11, org_id: 1 },
        { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', court_id: 11, org_id: 1 },
        { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', court_id: 11, org_id: 1 },
        { dayOfWeek: 6, startTime: '08:00', endTime: '17:00', court_id: 11, org_id: 1 },
        { dayOfWeek: 7, startTime: '08:00', endTime: '17:00', court_id: 11, org_id: 1 }
      ]);
    });
};