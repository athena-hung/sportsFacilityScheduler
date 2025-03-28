# Database Schema Documentation

This document details the database schema as defined in the migration file (20250301034234_create_schema.js).

## Tables

### org

- **id**: increments, primary key
- **name**: string, required
- **street**: string, optional
- **state**: string, optional
- **zip**: string, optional
- **defaultCourtsPerDay**: integer, required
- **phone**: string, optional

### court_type

- **id**: increments, primary key
- **name**: string, required
- **maxReservationTime**: integer, optional
- **org_id**: integer, foreign key referencing org(id) with CASCADE on delete

### court

- **id**: increments, primary key
- **name**: string, required
- **status**: string, required
- **image**: string, optional
- **street**: string, optional
- **state**: string, optional
- **zip**: string, optional
- **latitude**: float, optional
- **longitude**: float, optional
- **org_id**: integer, foreign key referencing org(id) with CASCADE on delete

### member_type

- **id**: increments, primary key
- **type**: string, required
- **org_id**: integer, foreign key referencing org(id) with CASCADE on delete
- **is_default**: boolean, required, default false

### user

- **id**: increments, primary key
- **firstName**: string, required
- **lastName**: string, required
- **address**: string, optional
- **birthdate**: string, optional
- **maxCourtsPerDay**: integer, required
- **email**: string, required, unique
- **password**: string, required (hashed)
- **org_id**: integer, foreign key referencing org(id) with CASCADE on delete
- **member_type_id**: integer, foreign key referencing member_type(id) with CASCADE on delete
- **timestamps**: created_at and updated_at managed automatically

### open_hour

- **id**: increments, primary key
- **dayOfWeek**: integer, required
- **startTime**: string, required
- **endTime**: string, required
- **court_id**: integer, foreign key referencing court(id) with CASCADE on delete
- **org_id**: integer, foreign key referencing org(id) with CASCADE on delete

### pricing

- **id**: increments, primary key
- **time**: integer, required (time in minutes)
- **price**: integer, required
- **timeStart**: string, optional
- **timeEnd**: string, optional
- **minAge**: integer, required
- **maxAge**: integer, required
- **court_id**: integer, foreign key referencing court(id) with CASCADE on delete
- **member_type_id**: integer, foreign key referencing member_type(id) with CASCADE on delete
- **org_id**: integer, foreign key referencing org(id) with CASCADE on delete

### reservation

- **id**: increments, primary key
- **start**: string, required
- **end**: string, required
- **reason**: string, optional
- **notes**: string, optional
- **status**: string, required, default "Confirmed"
- **court_id**: integer, foreign key referencing court(id) with CASCADE on delete
- **user_id**: integer, foreign key referencing user(id) with CASCADE on delete
- **org_id**: integer, foreign key referencing org(id) with CASCADE on delete

### court_court_type (junction table)

- **id**: increments, primary key
- **court_id**: integer, foreign key referencing court(id) with CASCADE on delete
- **court_type_id**: integer, foreign key referencing court_type(id) with CASCADE on delete
- **Unique constraint** on the combination of [court_id, court_type_id]
