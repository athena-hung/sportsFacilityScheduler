// backend/seeds/member_type.js
exports.seed = function(knex) {
    return knex('member_type').del()
      .then(function () {
        return knex('member_type').insert([
          { type: 'Regular', org_id: 1, is_default: true },
          { type: 'Premium', org_id: 1, is_default: false },
          { type: 'Admin', org_id: 1, is_default: false },
          { type: 'Child', org_id: 1, is_default: false },
          { type: 'Resident', org_id: 1, is_default: false },
          { type: 'Senior', org_id: 1, is_default: false }
        ]);
      });
  };