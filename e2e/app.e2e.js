const request = require('supertest');
const createApp = require('../src/app');
const { config } = require('../src/config/config');

describe('test for app', () => {
  let app = null;
  let server = null;
  let api = null;

  beforeAll(() => {
    app = createApp();
    server = app.listen(9000);
    api = request(app);
  });

  afterAll(() => {
    server.close();
  });

  describe('GET /hello', () => {
    test('should return 200', async () => {
      const response = await api.get('/hello');
      expect(response).toBeTruthy();
      expect(response.statusCode).toEqual(200);
      expect(response.body.name).toEqual('jesus');
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('GET /nueva-ruta', () => {
    test('should return 401 without apiKey', async () => {
      const { statusCode } = await api.get('/nueva-ruta');
      expect(statusCode).toEqual(401);
    });
    test('should return 401 with apiKey invalid', async () => {
      const { statusCode } = await api.get('/nueva-ruta').set({
        api: '123',
      });
      expect(statusCode).toEqual(401);
    });
    test('should return 200', async () => {
      const { statusCode } = await api.get('/nueva-ruta').set({
        api: config.apiKey,
      });
      expect(statusCode).toEqual(200);
    });
  });
});
