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
    await downSeed();
    server.close();
  });

  describe('GET /users/{id}', () => {
    test('should return a user', async () => {
      const user = await models.User.findByPk('1');
      const { statusCode, body } = await api.get(`/api/v1/users/${user.id}`);
      expect(statusCode).toBe(200);
      expect(body.id).toBe(user.id);
      expect(body.email).toBe(user.email);
    });
  });

  describe('POST /users', () => {
    test('should return a 400 Bad Request with password invalid', async () => {
      const inputData = {
        email: 'jesus@gmail.com',
        password: '-----',
      };

      const { statusCode, body } = await api
        .post('/api/v1/users')
        .send(inputData);

      expect(statusCode).toBe(400);
      expect(body.message).toMatch(/password/);
    });

    test('should return a 400 Bad Request with email invalid', async () => {
      const inputData = {
        email: '-----',
        password: '123456789',
      };

      const { statusCode, body } = await api
        .post('/api/v1/users')
        .send(inputData);

      expect(statusCode).toBe(400);
      expect(body.message).toMatch(/email/);
    });

    test('should return a new user', async () => {
      const inputData = {
        email: 'david@gmail.com',
        password: 'david123',
      };

      const { statusCode, body } = await api
        .post('/api/v1/users')
        .send(inputData);

      expect(statusCode).toBe(201);

      const user = await models.User.findByPk(body.id);
      expect(user).toBeTruthy();
      expect(user.role).toEqual('admin');
      expect(user.email).toEqual(inputData.email);
    });
  });

  describe('PUT /users', () => {});
});
