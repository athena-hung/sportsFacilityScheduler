// backend/seeds/member_type.js
exports.seed = function(knex) {
    return knex('member_type').del()
      .then(function () {
        return knex('member_type').insert([
          { type: 'Regular', org_id: 1 },
          { type: 'Premium', org_id: 1 }
        ]);
      });
  };