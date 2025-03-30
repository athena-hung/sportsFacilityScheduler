// backend/seeds/court.js
exports.seed = function(knex) {
  return knex('court').del()
    .then(function () {
      return knex('court').insert([
        { 
          name: 'Soccer Field 1', 
          status: 'available', 
          org_id: 1, 
          street: '1070 Piedmont Ave NE', 
          state: 'GA', 
          zip: '30309',
          latitude: 33.788162618779246,
          longitude: -84.38042384470278
        },
        { 
          name: 'Soccer Field 2', 
          status: 'available', 
          org_id: 1, 
          street: '1070 Piedmont Ave NE', 
          state: 'GA', 
          zip: '30309',
          latitude: 33.804265803957946,
          longitude: -84.36075708619197
        },
        { 
          name: 'Soccer Field 3', 
          status: 'available', 
          org_id: 1, 
          street: '1070 Piedmont Ave NE', 
          state: 'GA', 
          zip: '30309',
          latitude: 33.84735072856412,
          longitude: -84.38967210120418
        },
        { 
          name: 'Tennis Pb Court 1', 
          status: 'available', 
          org_id: 1, 
          street: '1070 Piedmont Ave NE', 
          state: 'GA', 
          zip: '30309',
          latitude: 33.811153625364874,
          longitude: -84.30487201167627
        },
        { 
          name: 'Tennis Pb Court 2', 
          status: 'available', 
          org_id: 1, 
          street: '1070 Piedmont Ave NE', 
          state: 'GA', 
          zip: '30309',
          latitude: 33.77220697800434,
          longitude: -84.308161091867
        },
        { 
          name: 'Tennis Court 3', 
          status: 'available', 
          org_id: 1, 
          street: '1070 Piedmont Ave NEt', 
          state: 'GA', 
          zip: '30309',
          latitude: 33.68671474852683,
          longitude: -84.38830244725123
        },
        { 
          name: 'Tennis Court 4', 
          status: 'available', 
          org_id: 1, 
          street: '1070 Piedmont Ave NE', 
          state: 'GA', 
          zip: '30309',
          latitude: 33.850011320256414,
          longitude: -84.4016266865964
        },
        { 
          name: 'Tennis Court 5', 
          status: 'available', 
          org_id: 1, 
          street: '1070 Piedmont Ave NE', 
          state: 'GA', 
          zip: '30309',
          latitude: 33.99383891470117,
          longitude: -84.15841730988389
        },
        { 
          name: 'Tennis Court 6', 
          status: 'available', 
          org_id: 1, 
          street: '1070 Piedmont Ave NE', 
          state: 'GA', 
          zip: '30309',
          latitude: 33.90731888525399,
          longitude: -84.5769648242514
        },
        { 
          name: 'Pickleball Court 1', 
          status: 'available', 
          org_id: 1, 
          street: '1070 Piedmont Ave NE', 
          state: 'GA', 
          zip: '30309',
          latitude: 33.8534278916284,
          longitude: -84.39902599432344
        },
        { 
          name: 'Pickleball Court 2', 
          status: 'available', 
          org_id: 1, 
          street: '1070 Piedmont Ave NE', 
          state: 'GA', 
          zip: '30309',
          latitude: 33.88104739396129,
          longitude: -84.28314115471836
        },
        { 
          name: 'Tennis Court 1', 
          status: 'available', 
          org_id: 2, 
          street: '1199 Mason St', 
          state: 'CA', 
          zip: '94108',
          latitude: 37.79426234362466,
          longitude: -122.41155250399024
        },
        { 
          name: 'Tennis Court 2', 
          status: 'available', 
          org_id: 2, 
          street: '1199 Mason St', 
          state: 'CA', 
          zip: '94108',
          latitude: 37.79426234362466,
          longitude: -122.41155250399024
        },
        { 
          name: 'Tennis Court 3', 
          status: 'available', 
          org_id: 2, 
          street: '1199 Mason St', 
          state: 'CA', 
          zip: '94108',
          latitude: 37.79426234362466,
          longitude: -122.41155250399024
        },
        { 
          name: 'Pickleball Court 1', 
          status: 'available', 
          org_id: 2, 
          street: '1199 Mason St', 
          state: 'CA', 
          zip: '94108',
          latitude: 37.79426234362466,
          longitude: -122.41155250399024
        },
        { 
          name: 'Pickleball Court 2', 
          status: 'available', 
          org_id: 2, 
          street: '1199 Mason St', 
          state: 'CA', 
          zip: '94108',
          latitude: 37.79426234362466,
          longitude: -122.41155250399024
        },
        { 
          name: 'Soccer Field 1', 
          status: 'available', 
          org_id: 3, 
          street: '348 E 54th St', 
          state: 'NY', 
          zip: '10022',
          latitude: 40.75662771119526,
          longitude: -73.9651783903532
        },
        { 
          name: 'Soccer Field 2', 
          status: 'available', 
          org_id: 3, 
          street: '348 E 54th St', 
          state: 'NY', 
          zip: '10022',
          latitude: 40.75662771119526,
          longitude: -73.9651783903532
        },
        { 
          name: 'Pickleball Court 1', 
          status: 'available', 
          org_id: 3, 
          street: '348 E 54th St', 
          state: 'NY', 
          zip: '10022',
          latitude: 40.75662771119526,
          longitude: -73.9651783903532
        },
        { 
          name: 'Pickleball Court 2', 
          status: 'available', 
          org_id: 3, 
          street: '348 E 54th St', 
          state: 'NY', 
          zip: '10022',
          latitude: 40.75662771119526,
          longitude: -73.9651783903532
        },
        { 
          name: 'Pickleball Court 3', 
          status: 'available', 
          org_id: 3, 
          street: '348 E 54th St', 
          state: 'NY', 
          zip: '10022',
          latitude: 40.75662771119526,
          longitude: -73.9651783903532
        },
        { 
          name: 'Pickleball Court 1', 
          status: 'available', 
          org_id: 4, 
          street: '1800 Chestnut St', 
          state: 'CA', 
          zip: '94123',
          latitude: 37.801605530981796,
          longitude: -122.43307584816698
        },
      ]);
    });
};