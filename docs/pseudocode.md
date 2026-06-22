# Pricing Engine — Pseudocode & Architecture

## Architecture

The pricing engine is a pure service function. It:
- Takes a bicycle ID as input.
- Queries repositories (no direct SQL in the engine itself).
- Returns a structured breakdown object.
- Has zero side effects.

This means it's trivially testable: mock the repositories, call the function, assert the output.

---

## Core Data Contract

```
Input:
  bicycleId: number

Output:
  {
    bicycle: { id, name, description },
    breakdown: [
      {
        component_id: number,
        component_name: string,
        category: string,
        quantity: number,
        unit_price: number | null,
        line_total: number | null,
        price_since: string | null,
        is_active: boolean,
        price_missing: boolean
      }
    ],
    category_subtotals: [
      { category: string, subtotal: number }
    ],
    grand_total: number,
    missing_prices: string[],    // component names with no price
    has_warnings: boolean
  }
```

---

## Pseudocode

```
FUNCTION calculateBicyclePrice(bicycleId):

  // Step 1: Verify bicycle exists
  bicycle = BicycleRepository.findById(bicycleId)
  IF bicycle is null:
    THROW NotFoundError("Bicycle not found")

  // Step 2: Get all components in this bicycle
  bicycleComponents = BicycleComponentRepository.findByBicycleId(bicycleId)
  
  IF bicycleComponents is empty:
    RETURN {
      bicycle,
      breakdown: [],
      category_subtotals: [],
      grand_total: 0,
      missing_prices: [],
      has_warnings: false
    }

  // Step 3: For each component, resolve current price
  breakdown = []
  missing_prices = []
  grand_total = 0

  FOR EACH item IN bicycleComponents:
    latestPrice = PriceRepository.getLatestPrice(item.component_id)
    
    IF latestPrice is null:
      // Price not set — flag it, include in breakdown with nulls
      missing_prices.PUSH(item.component_name)
      breakdown.PUSH({
        component_id:   item.component_id,
        component_name: item.component_name,
        category:       item.category,
        quantity:       item.quantity,
        unit_price:     null,
        line_total:     null,
        price_since:    null,
        is_active:      item.is_active,
        price_missing:  true
      })
      CONTINUE  // Skip adding to grand_total
    
    line_total = ROUND(latestPrice.price * item.quantity, 2)
    grand_total = grand_total + line_total
    
    breakdown.PUSH({
      component_id:   item.component_id,
      component_name: item.component_name,
      category:       item.category,
      quantity:       item.quantity,
      unit_price:     latestPrice.price,
      line_total:     line_total,
      price_since:    latestPrice.effective_date,
      is_active:      item.is_active,
      price_missing:  false
    })

  // Step 4: Group by category for subtotals
  category_map = {}
  FOR EACH item IN breakdown:
    IF item.line_total is not null:
      category_map[item.category] = (category_map[item.category] OR 0) + item.line_total

  category_subtotals = []
  FOR EACH [category, subtotal] IN category_map:
    category_subtotals.PUSH({ category, subtotal: ROUND(subtotal, 2) })
  SORT category_subtotals by category name

  // Step 5: Return
  RETURN {
    bicycle,
    breakdown,
    category_subtotals,
    grand_total: ROUND(grand_total, 2),
    missing_prices,
    has_warnings: missing_prices.length > 0
  }
```

---

## Edge Cases Handled

| Case | Handling |
|---|---|
| Bicycle not found | Throws NotFoundError → 404 response |
| Bicycle has no components | Returns empty breakdown, grand_total = 0 |
| Component has no price history | `price_missing: true`; excluded from total; flagged in `missing_prices` |
| Component is soft-deleted | Still included in breakdown; `is_active: false` |
| Price of ₹0 | Valid; treated as zero contribution to total |
| Floating point accumulation | All line totals rounded to 2dp before accumulation |

---

## Testability

```
// To test the pricing engine in isolation:
const mockBicycleRepo = {
  findById: (id) => ({ id: 1, name: 'Test Bike' })
};
const mockBicycleComponentRepo = {
  findByBicycleId: (id) => [
    { component_id: 1, component_name: 'Frame', category: 'Frame', quantity: 1, is_active: true },
    { component_id: 2, component_name: 'Tyre',  category: 'Tyre',  quantity: 2, is_active: true }
  ]
};
const mockPriceRepo = {
  getLatestPrice: (id) => {
    if (id === 1) return { price: 2500, effective_date: '2025-01-01' };
    if (id === 2) return { price: 220,  effective_date: '2025-06-01' };
  }
};

const result = calculateBicyclePrice(1, { mockBicycleRepo, mockBicycleComponentRepo, mockPriceRepo });

assert result.grand_total === 2940    // 2500 + (220 × 2)
assert result.breakdown.length === 2
assert result.missing_prices.length === 0
```
