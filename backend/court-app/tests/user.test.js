const request = require('supertest');
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig.development);
const bcrypt = require('bcryptjs');

const baseUrl = 'http://localhost:3000';

describe('User API Endpoints', () => {
  let orgId;
  let defaultMemberType, adminMemberType;
  let defaultMemberTypeId, adminMemberTypeId;
  let testUser; // non-admin user created via registration
  let testUserToken;
  let adminToken;
  let adminUserId; // admin user id

  const testUserEmail = `testuser${Date.now()}@example.com`;
  const testUserPassword = 'TestPassword123';
  const adminPassword = 'AdminPass123';

  beforeAll(async () => {
    // Run migrations before tests
    await knex.migrate.latest();
    
    // Insert a dummy org record required for user registration
    const orgData = {
      name: 'Test Org',
      defaultCourtsPerDay: 5
    };
    const insertedOrg = await knex('org').insert(orgData).returning('*');
    orgId = Array.isArray(insertedOrg) ? insertedOrg[0].id : insertedOrg;
    
    // Insert a default member type record for the organization (used by non-admin registrations)
    const defaultMemberTypeData = {
      type: 'Default Member',
      org_id: orgId,
      is_default: true
    };
    const insertedDefaultMT = await knex('member_type').insert(defaultMemberTypeData).returning('*');
    defaultMemberType = Array.isArray(insertedDefaultMT) ? insertedDefaultMT[0] : insertedDefaultMT;
    defaultMemberTypeId = defaultMemberType.id;
    
    // Insert an admin member type record
    const adminMemberTypeData = {
      type: 'Admin',
      org_id: orgId,
      is_default: false
    };
    const insertedAdminMT = await knex('member_type').insert(adminMemberTypeData).returning('*');
    adminMemberType = Array.isArray(insertedAdminMT) ? insertedAdminMT[0] : insertedAdminMT;
    adminMemberTypeId = adminMemberType.id;
    
    // Create an admin user directly (bypassing the registration endpoint)
    const hashedAdminPassword = bcrypt.hashSync(adminPassword, 10);
    const insertedAdminUser = await knex('user').insert({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedAdminPassword,
      org_id: orgId,
      member_type_id: adminMemberTypeId,
      maxCourtsPerDay: orgData.defaultCourtsPerDay
    }).returning('*');
    const adminUser = Array.isArray(insertedAdminUser) ? insertedAdminUser[0] : insertedAdminUser;
    adminUserId = adminUser.id;
  });

  afterAll(async () => {
    // Clean-up: remove users first, then member types, then the org record.
    await knex('user').where({ org_id: orgId }).del();
    await knex('member_type').where({ org_id: orgId }).del();
    await knex('org').where({ id: orgId }).del();
    await knex.destroy();
  });

  test('should register a new non-admin user', async () => {
    const res = await request(baseUrl)
      .post('/user/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        address: '123 Test St',
        birthdate: '2000-01-01',
        maxCourtsPerDay: 2,  // This field should be ignored for non-admins.
        email: testUserEmail,
        password: testUserPassword,
        org_id: orgId,
        member_type_id: adminMemberTypeId  // Should be ignored for non-admins.
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.user).toHaveProperty('id');

    // For non-admin registrations the API defaults to the first found default member type
    // and uses the organization's defaultCourtsPerDay.
    expect(res.body.user.member_type_id).toEqual(defaultMemberTypeId);
    expect(res.body.user.maxCourtsPerDay).toEqual(5);

    // Save the registered user for further tests.
    testUser = res.body.user;
  });

  test('should login with valid credentials and return a JWT for non-admin user', async () => {
    const res = await request(baseUrl)
      .post('/user/login')
      .send({
        email: testUserEmail,
        password: testUserPassword
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    testUserToken = res.body.token;
  });

  test('should login as admin and return a JWT', async () => {
    const res = await request(baseUrl)
      .post('/user/login')
      .send({
        email: 'admin@example.com',
        password: adminPassword
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    adminToken = res.body.token;
  });

  test('should retrieve the profile of the logged-in non-admin user', async () => {
    const res = await request(baseUrl)
      .get('/user/profile')
      .set('Authorization', `Bearer ${testUserToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.user).toHaveProperty('email', testUserEmail);
    expect(res.body.user).toHaveProperty('firstName', 'Test');
  });

  test('should update own user info without affecting member_type_id and maxCourtsPerDay for non-admin', async () => {
    const updatePayload = {
      firstName: 'UpdatedTest',
      lastName: 'UpdatedUser',
      // Attempt to update admin-only fields:
      member_type_id: adminMemberTypeId,
      maxCourtsPerDay: 10
    };

    const res = await request(baseUrl)
      .put(`/user/${testUser.id}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .send(updatePayload);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.user).toHaveProperty('firstName', 'UpdatedTest');
    expect(res.body.user).toHaveProperty('lastName', 'UpdatedUser');

    // These admin-only fields should remain unchanged when updated by a non-admin.
    expect(res.body.user.member_type_id).toEqual(defaultMemberTypeId);
    expect(res.body.user.maxCourtsPerDay).toEqual(5);
  });

  test('should allow admin to update user info including member_type_id and maxCourtsPerDay', async () => {
    const updatePayload = {
      firstName: 'AdminUpdated',
      member_type_id: adminMemberTypeId,
      maxCourtsPerDay: 8
    };

    // Admin updates the non-admin user's profile.
    const res = await request(baseUrl)
      .put(`/user/${testUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatePayload);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.user).toHaveProperty('firstName', 'AdminUpdated');
    // Since admin performed the update, the privileged fields should be updated.
    expect(res.body.user.member_type_id).toEqual(adminMemberTypeId);
    expect(res.body.user.maxCourtsPerDay).toEqual(8);
  });
}); 