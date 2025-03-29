exports.seed = function(knex) {
  return knex('court_type').del()
    .then(function () {
      return knex('court_type').insert([
        { name: 'Type A', maxReservationTime: 120, org_id: 1 },
        { name: 'Type B', maxReservationTime: 90, org_id: 1 }
      ]);
    });
};
