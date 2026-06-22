process.env.DB_PATH = ':memory:';
const request = require('supertest');
const app = require('../app');
const { setupTestDb } = require('./testHelper');

setupTestDb();
beforeAll(async () => { await app.initializeDb(); });

async function makeComponent(name = 'Frame', category = 'Frame', price = 1000) {
  const res = await request(app).post('/api/components').send({ name, category, initial_price: price });
  return res.body.data.id;
}
async function makeBicycle(name = 'Test Bike') {
  const res = await request(app).post('/api/bicycles').send({ name });
  return res.body.data.id;
}

describe('Bicycle API', () => {
  describe('POST /api/bicycles', () => {
    test('creates bicycle with valid data', async () => {
      const res = await request(app).post('/api/bicycles').send({ name: 'Hero Sprint', description: 'City' });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Hero Sprint');
    });

    test('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/bicycles').send({ description: 'No name' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/bicycles', () => {
    test('lists all bicycles', async () => {
      await makeBicycle('Bike A');
      const res = await request(app).get('/api/bicycles');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/bicycles/:id/components', () => {
    test('adds component to bicycle', async () => {
      const bikeId = await makeBicycle();
      const compId = await makeComponent();
      const res = await request(app).post(`/api/bicycles/${bikeId}/components`).send({ component_id: compId, quantity: 1 });
      expect(res.status).toBe(201);
    });

    test('upserts quantity when adding same component twice', async () => {
      const bikeId = await makeBicycle();
      const compId = await makeComponent('Tyre', 'Tyre', 220);

      await request(app).post(`/api/bicycles/${bikeId}/components`).send({ component_id: compId, quantity: 1 });
      await request(app).post(`/api/bicycles/${bikeId}/components`).send({ component_id: compId, quantity: 2 });

      const res = await request(app).get(`/api/bicycles/${bikeId}`);
      const tyres = res.body.data.components.filter(c => c.component_id === compId);
      expect(tyres.length).toBe(1);
      expect(tyres[0].quantity).toBe(2);
    });

    test('returns 400 for quantity 0', async () => {
      const bikeId = await makeBicycle();
      const compId = await makeComponent();
      const res = await request(app).post(`/api/bicycles/${bikeId}/components`).send({ component_id: compId, quantity: 0 });
      expect(res.status).toBe(400);
    });

    test('returns 404 for non-existent component', async () => {
      const bikeId = await makeBicycle();
      const res = await request(app).post(`/api/bicycles/${bikeId}/components`).send({ component_id: 99999, quantity: 1 });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/bicycles/:id/pricing', () => {
    test('returns full pricing breakdown', async () => {
      const bikeId = await makeBicycle('Priced Bike');
      const frameId = await makeComponent('Frame', 'Frame', 2500);
      const tyreId  = await makeComponent('Tyre', 'Tyre', 220);

      await request(app).post(`/api/bicycles/${bikeId}/components`).send({ component_id: frameId, quantity: 1 });
      await request(app).post(`/api/bicycles/${bikeId}/components`).send({ component_id: tyreId, quantity: 2 });

      const res = await request(app).get(`/api/bicycles/${bikeId}/pricing`);
      expect(res.status).toBe(200);
      expect(res.body.data.grand_total).toBe(2940);
      expect(res.body.data.breakdown).toHaveLength(2);
      expect(res.body.data.category_subtotals.length).toBeGreaterThan(0);
    });

    test('returns 404 for non-existent bicycle', async () => {
      const res = await request(app).get('/api/bicycles/99999/pricing');
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/bicycles/:id', () => {
    test('deletes bicycle successfully', async () => {
      const bikeId = await makeBicycle('To Delete');
      const res = await request(app).delete(`/api/bicycles/${bikeId}`);
      expect(res.status).toBe(200);
      const getRes = await request(app).get(`/api/bicycles/${bikeId}`);
      expect(getRes.status).toBe(404);
    });
  });
});
