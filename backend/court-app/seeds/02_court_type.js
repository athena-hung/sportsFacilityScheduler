exports.seed = function(knex) {
  return knex('court_type').del()
    .then(function () {
      return knex('court_type').insert([
        { name: 'Soccer', maxReservationTime: 180, org_id: 1 },
        { name: 'Tennis', maxReservationTime: 120, org_id: 1 },
        { name: 'Pickleball', maxReservationTime: 120, org_id: 1 },
        { name: 'Soccer', maxReservationTime: 120, org_id: 2 },
        { name: 'Tennis', maxReservationTime: 90, org_id: 2 },
        { name: 'Pickleball', maxReservationTime: 90, org_id: 2 },
        { name: 'Soccer', maxReservationTime: 180, org_id: 3 },
        { name: 'Tennis', maxReservationTime: 60, org_id: 3 },
        { name: 'Pickleball', maxReservationTime: 120, org_id: 3 },
        { name: 'Soccer', maxReservationTime: 180, org_id: 4 },
        { name: 'Tennis', maxReservationTime: 90, org_id: 4 },
        { name: 'Pickleball', maxReservationTime: 60, org_id: 4 },
        { name: 'Soccer', maxReservationTime: 120, org_id: 5 },
        { name: 'Tennis', maxReservationTime: 60, org_id: 5 },
        { name: 'Pickleball', maxReservationTime: 60, org_id: 5 }
      ]);
    });
};
