exports.up = function(knex) {
    return knex.schema
      // Org table
      .createTable('org', function(table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('address');
        table.integer('defaultCourtsPerDay').notNullable();
      })
  
      // CourtType table
      .createTable('court_type', function(table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.integer('maxReservationTime');
        table.integer('org_id').unsigned().references('id').inTable('org');
      })
  
      // Court table
      .createTable('court', function(table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('status').notNullable();
        table.integer('court_type_id').unsigned().references('id').inTable('court_type');
        table.integer('org_id').unsigned().references('id').inTable('org');
      })
  
      // Contact table
      .createTable('contact', function(table) {
        table.increments('id').primary();
        table.string('firstName');
        table.string('lastName');
        table.integer('org_id').unsigned().references('id').inTable('org');
      })
  
      // MemberTypes table
      .createTable('member_type', function(table) {
        table.increments('id').primary();
        table.string('type').notNullable();
        table.integer('org_id').unsigned().references('id').inTable('org');
      })
  
      // Person table
      .createTable('person', function(table) {
        table.increments('id').primary();
        table.string('firstName').notNullable();
        table.string('lastName').notNullable();
        table.string('address');
        table.string('birthdate');
        table.integer('maxCourtsPerDay').notNullable();
        table.integer('org_id').unsigned().references('id').inTable('org');
        table.integer('member_type_id').unsigned().references('id').inTable('member_type');
      })
  
      // OpenHours table
      .createTable('open_hour', function(table) {
        table.increments('id').primary();
        table.integer('dayOfWeek').notNullable();
        table.string('startTime').notNullable();
        table.string('endTime').notNullable();
      })
  
      // CourtOpenHours table
      .createTable('court_open_hour', function(table) {
        table.increments('id').primary();
        table.integer('openHoursId').unsigned().references('id').inTable('open_hour');
        table.integer('court_id').unsigned().references('id').inTable('court');
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
        table.integer('court_id').unsigned().references('id').inTable('court');
        table.integer('member_type_id').unsigned().references('id').inTable('member_type');
      })
  
      // Reservation table
      .createTable('reservation', function(table) {
        table.increments('id').primary();
        table.string('start').notNullable();
        table.string('end').notNullable();
        table.string('reason');
        table.string('notes');
        table.integer('court_id').unsigned().references('id').inTable('court');
        table.integer('person_id').unsigned().references('id').inTable('person');
      })
  };
  
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists('reservation')
      .dropTableIfExists('pricing')
      .dropTableIfExists('open_hour')
      .dropTableIfExists('court_open_hour')
      .dropTableIfExists('member_type')
      .dropTableIfExists('person')
      .dropTableIfExists('contact')
      .dropTableIfExists('court')
      .dropTableIfExists('court_type')
      .dropTableIfExists('org');
  };
  