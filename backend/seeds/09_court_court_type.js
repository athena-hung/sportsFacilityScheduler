exports.seed = function(knex) {
  return knex('court_court_type').del()
    .then(function () {
      return knex('court_court_type').insert([
        { court_id: 1, court_type_id: 1 },
        { court_id: 2, court_type_id: 2 }
      ]);
    });
};