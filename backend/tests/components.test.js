process.env.DB_PATH = ':memory:';
const request = require('supertest');
const app = require('../app');
const { setupTestDb } = require('./testHelper');

setupTestDb();

// Initialize DB before tests
beforeAll(async () => { await app.initializeDb(); });

describe('Component API', () => {
  describe('POST /api/components', () => {
    test('creates component with valid data', async () => {
      const res = await request(app).post('/api/components').send({
        name: 'Test Frame', category: 'Frame', initial_price: 2500
      });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Test Frame');
      expect(res.body.data.current_price).toBe(2500);
    });

    test('creates component without initial price', async () => {
      const res = await request(app).post('/api/components').send({ name: 'No Price Part', category: 'Other' });
      expect(res.status).toBe(201);
      expect(res.body.data.current_price).toBeNull();
    });

    test('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/components').send({ category: 'Frame' });
      expect(res.status).toBe(400);
    });

    test('returns 400 for invalid category', async () => {
      const res = await request(app).post('/api/components').send({ name: 'Valid Name', category: 'InvalidCategory' });
      expect(res.status).toBe(400);
    });

    test('returns 400 for negative price', async () => {
      const res = await request(app).post('/api/components').send({ name: 'Test', category: 'Other', initial_price: -100 });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/components', () => {
    test('returns list of components', async () => {
      await request(app).post('/api/components').send({ name: 'Frame A', category: 'Frame' });
      const res = await request(app).get('/api/components');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });

    test('excludes deactivated components by default', async () => {
      const createRes = await request(app).post('/api/components').send({ name: 'Soon Deleted', category: 'Other' });
      const id = createRes.body.data.id;
      await request(app).delete(`/api/components/${id}`);

      const res = await request(app).get('/api/components');
      const names = res.body.data.map(c => c.name);
      expect(names).not.toContain('Soon Deleted');
    });
  });

  describe('GET /api/components/:id', () => {
    test('returns component with price history', async () => {
      const cr = await request(app).post('/api/components').send({ name: 'With History', category: 'Frame', initial_price: 2000 });
      const id = cr.body.data.id;
      const res = await request(app).get(`/api/components/${id}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.price_history)).toBe(true);
      expect(res.body.data.price_history.length).toBe(1);
    });

    test('returns 404 for non-existent component', async () => {
      const res = await request(app).get('/api/components/99999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/components/:id/prices', () => {
    test('adds new prices and preserves history', async () => {
      const cr = await request(app).post('/api/components').send({ name: 'Tyre B', category: 'Tyre', initial_price: 200 });
      const id = cr.body.data.id;

      await request(app).post(`/api/components/${id}/prices`).send({ price: 220, notes: 'Revision' });
      await request(app).post(`/api/components/${id}/prices`).send({ price: 230, notes: 'Freight' });

      const res = await request(app).get(`/api/components/${id}/prices`);
      expect(res.body.data.length).toBe(3);
      expect(res.body.data[0].price).toBe(230); // most recent first
    });

    test('returns 400 for negative price', async () => {
      const cr = await request(app).post('/api/components').send({ name: 'Brake A', category: 'Brake' });
      const res = await request(app).post(`/api/components/${cr.body.data.id}/prices`).send({ price: -50 });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/components/:id', () => {
    test('soft-deletes component (still retrievable)', async () => {
      const cr = await request(app).post('/api/components').send({ name: 'To Delete', category: 'Other' });
      const id = cr.body.data.id;

      await request(app).delete(`/api/components/${id}`);
      const getRes = await request(app).get(`/api/components/${id}`);
      expect(Number(getRes.body.data.is_active)).toBe(0);
    });

    test('returns 404 for non-existent component', async () => {
      const res = await request(app).delete('/api/components/99999');
      expect(res.status).toBe(404);
    });
  });
});
