const bicycleRepository = require('../repositories/bicycleRepository');
const bicycleComponentRepository = require('../repositories/bicycleComponentRepository');
const { createError } = require('../middleware/errorHandler');

/**
 * PricingService — the core pricing engine.
 * Pure async function: given a bicycleId, returns a detailed pricing breakdown.
 * No side effects. Reads only.
 */
async function calculateBicyclePrice(bicycleId) {
  const bicycle = await bicycleRepository.findById(bicycleId);
  if (!bicycle) throw createError(404, 'Bicycle not found', 'NOT_FOUND');

  const items = await bicycleComponentRepository.findByBicycleId(bicycleId);

  const breakdown = [];
  const missing_prices = [];
  let grand_total = 0;

  for (const item of items) {
    const priceMissing = item.unit_price === null || item.unit_price === undefined;

    if (priceMissing) {
      missing_prices.push(item.component_name);
      breakdown.push({
        component_id:   item.component_id,
        component_name: item.component_name,
        category:       item.category,
        quantity:       item.quantity,
        unit_price:     null,
        line_total:     null,
        price_since:    null,
        is_active:      Number(item.is_active) === 1,
        price_missing:  true
      });
      continue;
    }

    const line_total = Math.round(Number(item.unit_price) * item.quantity * 100) / 100;
    grand_total += line_total;

    breakdown.push({
      component_id:   item.component_id,
      component_name: item.component_name,
      category:       item.category,
      quantity:       item.quantity,
      unit_price:     Number(item.unit_price),
      line_total,
      price_since:    item.price_since,
      is_active:      Number(item.is_active) === 1,
      price_missing:  false
    });
  }

  // Category subtotals
  const categoryMap = {};
  for (const item of breakdown) {
    if (item.line_total !== null) {
      categoryMap[item.category] = (categoryMap[item.category] || 0) + item.line_total;
    }
  }

  const category_subtotals = Object.entries(categoryMap)
    .map(([category, subtotal]) => ({ category, subtotal: Math.round(subtotal * 100) / 100 }))
    .sort((a, b) => a.category.localeCompare(b.category));

  return {
    bicycle,
    breakdown,
    category_subtotals,
    grand_total: Math.round(grand_total * 100) / 100,
    missing_prices,
    has_warnings: missing_prices.length > 0 || breakdown.some(b => !b.is_active)
  };
}

module.exports = { calculateBicyclePrice };
