const request = require('supertest');
const createApp = require('../src/app');
const { models } = require('../src/db/sequelize');
// const { upSeed, downSeed } = require('./utils/seed');
const { upSeed, downSeed } = require('./utils/umzug');

describe('test for /users path', () => {
  let app = null;
  let server = null;
  let api = null;

  beforeAll(async () => {
    app = createApp();
    server = app.listen(9000);
    api = request(app);
    await upSeed();
  });

  afterAll(async () => {
    server.close();
    await downSeed();
  });

  describe('GET /my-user', () => {
    let user = null;
    let accessToken = null;

    beforeAll(async () => {
      user = await models.User.findByPk('1');
      const inputData = {
        email: user.email,
        password: 'admin123',
      };

      const { body: bodyLogin } = await api
        .post('/api/v1/auth/login')
        .send(inputData);
      accessToken = bodyLogin.access_token;
    });

    test('should return 401 without token', async () => {
      const { statusCode } = await api.get('/api/v1/profile/my-user');
      expect(statusCode).toBe(401);
    });

    test('should return 401 with invalid token', async () => {
      const { statusCode } = await api.get('/api/v1/profile/my-user').set({
        Authorization: 'Bearer 12345',
      });
      expect(statusCode).toBe(401);
    });

    test('should return a user with token valid', async () => {
      const { statusCode, body } = await api
        .get('/api/v1/profile/my-user')
        .set({
          Authorization: `Bearer ${accessToken}`,
        });
      expect(statusCode).toBe(200);
      expect(body.email).toEqual(user.email);
    });
  });

  describe('GET /my-orders', () => {
    let user = null;
    let accessToken = null;

    beforeAll(async () => {
      user = await models.User.findByPk('1');
      const inputData = {
        email: user.email,
        password: 'admin123',
      };

      const { body: bodyLogin } = await api
        .post('/api/v1/auth/login')
        .send(inputData);
      accessToken = bodyLogin.access_token;
    });

    test('should return 401 without token', async () => {
      const { statusCode } = await api.get('/api/v1/profile/my-orders');
      expect(statusCode).toBe(401);
    });

    test('should return 401 with invalid token', async () => {
      const { statusCode } = await api.get('/api/v1/profile/my-orders').set({
        Authorization: 'Bearer 12345',
      });
      expect(statusCode).toBe(401);
    });

    test('should return a user with token valid', async () => {
      const { statusCode, body } = await api
        .get('/api/v1/profile/my-orders')
        .set({
          Authorization: `Bearer ${accessToken}`,
        });
      expect(statusCode).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });
  });
});
