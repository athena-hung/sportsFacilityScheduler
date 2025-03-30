// backend/seeds/org.js
exports.seed = function(knex) {
  return knex('org').del() // Deletes ALL existing entries
    .then(function () {
      return knex('org').insert([
        { name: 'Organization A', street: '1070 Piedmont Ave NE', state: 'GA', zip: '30309', defaultCourtsPerDay: 5, phone: '123-456-7890' },
        { name: 'Organization B', street: '1199 Mason St', state: 'CA', zip: '94108', defaultCourtsPerDay: 3, phone: '987-654-3210' },
        { name: 'Organization C', street: '348 E 54th St', state: 'NY', zip: '10022', defaultCourtsPerDay: 4, phone: '321-654-0987' },
        { name: 'Organization D', street: '1800 Chestnut St', state: 'CA', zip: '94123', defaultCourtsPerDay: 2, phone: '456-123-7899' },
        { name: 'Organization E', street: '1900 Geary Blvd', state: 'CA', zip: '94115', defaultCourtsPerDay: 6, phone: '654-987-3210' }
      ]);
    });
};