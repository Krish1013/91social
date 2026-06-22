const { setupTestDb } = require('./testHelper');
const { getDb } = require('../database/connection');
const { calculateBicyclePrice } = require('../services/pricingService');

setupTestDb();

async function createComponent(name = 'Test Frame', category = 'Frame') {
  const db = getDb();
  const r = await db.execute({ sql: 'INSERT INTO components (name, category) VALUES (?, ?)', args: [name, category] });
  return Number(r.lastInsertRowid);
}

async function setPrice(componentId, price, date = null) {
  const db = getDb();
  const d = date || new Date().toISOString().replace('T',' ').slice(0,19);
  await db.execute({ sql: 'INSERT INTO component_price_history (component_id, price, effective_date) VALUES (?, ?, ?)', args: [componentId, price, d] });
}

async function createBicycle(name = 'Test Bike') {
  const db = getDb();
  const r = await db.execute({ sql: 'INSERT INTO bicycles (name) VALUES (?)', args: [name] });
  return Number(r.lastInsertRowid);
}

async function addToBicycle(bicycleId, componentId, quantity = 1) {
  const db = getDb();
  await db.execute({ sql: 'INSERT INTO bicycle_components (bicycle_id, component_id, quantity) VALUES (?, ?, ?)', args: [bicycleId, componentId, quantity] });
}

describe('PricingService.calculateBicyclePrice', () => {
  test('throws 404 for non-existent bicycle', async () => {
    await expect(calculateBicyclePrice(9999)).rejects.toThrow('Bicycle not found');
  });

  test('returns zero total for bicycle with no components', async () => {
    const id = await createBicycle('Empty Bike');
    const result = await calculateBicyclePrice(id);
    expect(result.grand_total).toBe(0);
    expect(result.breakdown).toHaveLength(0);
    expect(result.has_warnings).toBe(false);
  });

  test('calculates correct total for single component', async () => {
    const compId = await createComponent('Steel Frame', 'Frame');
    await setPrice(compId, 2500);
    const bikeId = await createBicycle();
    await addToBicycle(bikeId, compId, 1);

    const result = await calculateBicyclePrice(bikeId);
    expect(result.grand_total).toBe(2500);
    expect(result.breakdown[0].unit_price).toBe(2500);
    expect(result.breakdown[0].line_total).toBe(2500);
    expect(result.breakdown[0].price_missing).toBe(false);
  });

  test('multiplies unit price by quantity correctly', async () => {
    const compId = await createComponent('Tyre', 'Tyre');
    await setPrice(compId, 220);
    const bikeId = await createBicycle();
    await addToBicycle(bikeId, compId, 2);

    const result = await calculateBicyclePrice(bikeId);
    expect(result.breakdown[0].quantity).toBe(2);
    expect(result.breakdown[0].line_total).toBe(440);
    expect(result.grand_total).toBe(440);
  });

  test('uses the LATEST price when multiple prices exist', async () => {
    const compId = await createComponent('Frame', 'Frame');
    await setPrice(compId, 2000, '2025-01-01 00:00:00');
    await setPrice(compId, 2350, '2025-06-01 00:00:00');
    await setPrice(compId, 2500, '2025-12-01 00:00:00');

    const bikeId = await createBicycle();
    await addToBicycle(bikeId, compId, 1);

    const result = await calculateBicyclePrice(bikeId);
    expect(result.breakdown[0].unit_price).toBe(2500);
    expect(result.grand_total).toBe(2500);
  });

  test('flags component with missing price and excludes from total', async () => {
    const compWithPrice = await createComponent('Frame', 'Frame');
    await setPrice(compWithPrice, 2000);
    const compNoPrice = await createComponent('Rare Part', 'Other');

    const bikeId = await createBicycle();
    await addToBicycle(bikeId, compWithPrice, 1);
    await addToBicycle(bikeId, compNoPrice, 1);

    const result = await calculateBicyclePrice(bikeId);
    expect(result.missing_prices).toContain('Rare Part');
    expect(result.has_warnings).toBe(true);
    expect(result.grand_total).toBe(2000);
    const missing = result.breakdown.find(b => b.component_name === 'Rare Part');
    expect(missing.price_missing).toBe(true);
    expect(missing.line_total).toBeNull();
  });

  test('calculates correct category subtotals', async () => {
    const frame = await createComponent('Frame A', 'Frame');
    const tyre  = await createComponent('Tyre A', 'Tyre');
    await setPrice(frame, 2500);
    await setPrice(tyre, 220);

    const bikeId = await createBicycle();
    await addToBicycle(bikeId, frame, 1);
    await addToBicycle(bikeId, tyre, 2);

    const result = await calculateBicyclePrice(bikeId);
    const frameCat = result.category_subtotals.find(c => c.category === 'Frame');
    const tyreCat  = result.category_subtotals.find(c => c.category === 'Tyre');
    expect(frameCat.subtotal).toBe(2500);
    expect(tyreCat.subtotal).toBe(440);
    expect(result.grand_total).toBe(2940);
  });

  test('handles price of zero gracefully', async () => {
    const compId = await createComponent('Free Part', 'Other');
    await setPrice(compId, 0);
    const bikeId = await createBicycle();
    await addToBicycle(bikeId, compId, 1);

    const result = await calculateBicyclePrice(bikeId);
    expect(result.breakdown[0].unit_price).toBe(0);
    expect(result.breakdown[0].price_missing).toBe(false);
    expect(result.grand_total).toBe(0);
  });

  test('floating point values are rounded to 2 decimal places', async () => {
    const compId = await createComponent('Chain', 'Chain');
    await setPrice(compId, 333.33);
    const bikeId = await createBicycle();
    await addToBicycle(bikeId, compId, 3);

    const result = await calculateBicyclePrice(bikeId);
    expect(result.breakdown[0].line_total).toBe(999.99);
    expect(result.grand_total).toBe(999.99);
  });
});
