exports.seed = function(knex) {
  return knex('court_court_type').del()
    .then(function () {
      return knex('court_court_type').insert([
        { court_id: 1, court_type_id: 1 },
        { court_id: 2, court_type_id: 1 },
        { court_id: 3, court_type_id: 1 },
        { court_id: 4, court_type_id: 2 },
        { court_id: 5, court_type_id: 2 },
        { court_id: 6, court_type_id: 2 },
        { court_id: 7, court_type_id: 2 },
        { court_id: 8, court_type_id: 2 },
        { court_id: 9, court_type_id: 2 },
        { court_id: 4, court_type_id: 3 },
        { court_id: 5, court_type_id: 3 },
        { court_id: 10, court_type_id: 3 },
        { court_id: 11, court_type_id: 3 },
      ]);
    });
};
