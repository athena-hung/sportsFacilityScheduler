exports.up = function(knex) {
    return knex.schema
      // Org table
      .createTable('org', function(table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('street');
        table.string('state');
        table.string('zip');
        table.integer('defaultCourtsPerDay').notNullable();
        table.string('phone');
      })
  
      // CourtType table
      .createTable('court_type', function(table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.integer('maxReservationTime');
        table.integer('org_id').unsigned().references('id').inTable('org').onDelete('CASCADE');
      })
  
      // Court table
      .createTable('court', function(table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('status').notNullable();
        table.string('image');
        table.string('street');
        table.string('state');
        table.string('zip');
        table.float('latitude');
        table.float('longitude');
        table.integer('org_id').unsigned().references('id').inTable('org').onDelete('CASCADE');
      })
  
      // MemberTypes table
      .createTable('member_type', function(table) {
        table.increments('id').primary();
        table.string('type').notNullable();
        table.integer('org_id').unsigned().references('id').inTable('org').onDelete('CASCADE');
        table.boolean('is_default').notNullable().defaultTo(false);
      })
  
      // Person table
      .createTable('user', function(table) {
        table.increments('id').primary();
        table.string('firstName').notNullable();
        table.string('lastName').notNullable();
        table.string('address');
        table.string('birthdate');
        table.integer('maxCourtsPerDay').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable(); // Store hashed password here
        table.integer('org_id').unsigned().references('id').inTable('org').onDelete('CASCADE');
        table.integer('member_type_id').unsigned().references('id').inTable('member_type').onDelete('CASCADE');
        table.timestamps(true, true);
      })
  
      // OpenHours table
      .createTable('open_hour', function(table) {
        table.increments('id').primary();
        table.integer('dayOfWeek').notNullable();
        table.string('startTime').notNullable();
        table.string('endTime').notNullable();
        table.integer('court_id').unsigned().references('id').inTable('court').onDelete('CASCADE');
        table.integer('org_id').unsigned().references('id').inTable('org').onDelete('CASCADE');
      })
  
      // Pricing table
      .createTable('pricing', function(table) {
        table.increments('id').primary();
        table.integer('time').notNullable(); // time in minutes
        table.integer('price').notNullable();
        table.string('timeStart');
        table.string('timeEnd');
        table.integer('minAge').notNullable(); // senior rate
        table.integer('maxAge').notNullable(); // youth rate
        table.integer('court_id').unsigned().references('id').inTable('court').onDelete('CASCADE');
        table.integer('member_type_id').unsigned().references('id').inTable('member_type').onDelete('CASCADE');
        table.integer('org_id').unsigned().references('id').inTable('org').onDelete('CASCADE');
      })
  
      // Reservation table
      .createTable('reservation', function(table) {
        table.increments('id').primary();
        table.string('start').notNullable();
        table.string('end').notNullable();
        table.string('reason');
        table.string('notes');
        table.string('status').notNullable().defaultTo('Confirmed');
        table.integer('court_id').unsigned().references('id').inTable('court').onDelete('CASCADE');
        table.integer('user_id').unsigned().references('id').inTable('user').onDelete('CASCADE');
        table.integer('org_id').unsigned().references('id').inTable('org').onDelete('CASCADE');
      })
  
      // CourtCourtType table (junction table)
      .createTable('court_court_type', function(table) {
        table.increments('id').primary();
        table.integer('court_id').unsigned().references('id').inTable('court').onDelete('CASCADE');
        table.integer('court_type_id').unsigned().references('id').inTable('court_type').onDelete('CASCADE');
        table.unique(['court_id', 'court_type_id']); // Ensure unique pairs
      })
  };
  
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists('reservation')
      .dropTableIfExists('pricing')
      .dropTableIfExists('open_hour')
      .dropTableIfExists('court_open_hour')
      .dropTableIfExists('member_type')
      .dropTableIfExists('user')
      .dropTableIfExists('court')
      .dropTableIfExists('court_type')
      .dropTableIfExists('org');
  };
  