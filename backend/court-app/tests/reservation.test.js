const request = require('supertest');
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig.development);
const app = require('../server');

describe('Reservation API Endpoints', () => {
  let orgId, memberTypeId, courtId;
  let token;
  let reservationId;
  const testUserEmail = `reservationtest${Date.now()}@example.com`;
  const password = 'TestPassword123';

  beforeAll(async () => {
    // Run migrations
    await knex.migrate.latest();

    // Insert a dummy organization required for user registration
    const orgData = {
      name: 'Reservation Test Org',
      defaultCourtsPerDay: 5
    };
    const insertedOrg = await knex('org').insert(orgData).returning('*');
    orgId = Array.isArray(insertedOrg) ? insertedOrg[0].id : insertedOrg;

    // Insert a dummy member type record
    const memberTypeData = {
      type: 'Test Member', // non-admin type
      org_id: orgId,
      is_default: true
    };
    const insertedMemberType = await knex('member_type').insert(memberTypeData).returning('*');
    memberTypeId = Array.isArray(insertedMemberType) ? insertedMemberType[0].id : insertedMemberType;

    // Insert a dummy court record
    const courtData = {
      name: 'Test Court',
      status: 'Available',
      org_id: orgId
    };
    const insertedCourt = await knex('court').insert(courtData).returning('*');
    courtId = Array.isArray(insertedCourt) ? insertedCourt[0].id : insertedCourt;

    // Register a new user
    const registerResponse = await request(app)
      .post('/user/register')
      .send({
        firstName: 'Reservation',
        lastName: 'Tester',
        address: '123 Test Ave',
        birthdate: '2000-01-01',
        maxCourtsPerDay: 2,
        email: testUserEmail,
        password: password,
        org_id: orgId
      });
    expect(registerResponse.statusCode).toEqual(201);

    // Login to get a JWT token
    const loginResponse = await request(app)
      .post('/user/login')
      .send({
        email: testUserEmail,
        password: password
      });
    expect(loginResponse.statusCode).toEqual(200);
    expect(loginResponse.body).toHaveProperty('token');
    token = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up by deleting reservations, courts, users, member types, and org in order
    await knex('reservation').del();
    await knex('court').where({ org_id: orgId }).del();
    await knex('user').where({ org_id: orgId }).del();
    await knex('member_type').where({ org_id: orgId }).del();
    await knex('org').where({ id: orgId }).del();
    await knex.destroy();
  });

  test('should create a reservation', async () => {
    const reservationData = {
      start: '2025-05-01T10:00:00Z',
      end: '2025-05-01T11:00:00Z',
      reason: 'Test reservation creation',
      notes: 'Test notes',
      courtId: courtId
      // for non-admin user, personId is not provided and status will default to "Pending"
    };

    const response = await request(app)
      .post('/reservation')
      .set('Authorization', `Bearer ${token}`)
      .send(reservationData);

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('reservation');
    expect(response.body.reservation).toHaveProperty('id');
    expect(response.body.reservation.user_id).toBeDefined();
    expect(response.body.reservation.status).toEqual('Pending');
    
    reservationId = response.body.reservation.id;
  });

  test('should get reservations', async () => {
    const response = await request(app)
      .get('/reservation')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.body)).toBe(true);
    // Verify that the created reservation is returned
    const reservation = response.body.find(r => r.id === reservationId);
    expect(reservation).toBeDefined();
  });

  test('should update a reservation', async () => {
    const updateData = {
      reason: 'Updated reason',
      notes: 'Updated notes',
      end: '2025-05-01T12:00:00Z'
    };

    const response = await request(app)
      .put(`/reservation/${reservationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('reservation');
    expect(response.body.reservation.reason).toEqual('Updated reason');
    expect(response.body.reservation.notes).toEqual('Updated notes');
    expect(new Date(response.body.reservation.end).toISOString()).toEqual('2025-05-01T12:00:00.000Z');
  });
});