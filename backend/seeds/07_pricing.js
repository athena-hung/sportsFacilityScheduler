// backend/seeds/pricing.js
exports.seed = function(knex) {
  return knex('pricing').del()
    .then(function () {
      return knex('pricing').insert([
        { time: 60, price: 20, timeStart: '08:00', timeEnd: '09:00', minAge: 18, maxAge: 65, court_id: 1, member_type_id: 1, org_id: 1 },
        { time: 90, price: 30, timeStart: '09:00', timeEnd: '10:30', minAge: 18, maxAge: 65, court_id: 2, member_type_id: 2, org_id: 1 }
      ]);
    });
};