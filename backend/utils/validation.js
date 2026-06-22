const VALID_CATEGORIES = [
  'Frame', 'Tyre', 'Gear Set', 'Brake', 'Seat',
  'Chain', 'Handlebar', 'Pedal', 'Rim', 'Light', 'Other'
];

/**
 * Returns an array of error messages for the given component fields.
 * Empty array = valid.
 */
function validateComponent({ name, category }) {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters.');
  }
  if (name && name.trim().length > 100) {
    errors.push('Name must not exceed 100 characters.');
  }
  if (!category || !VALID_CATEGORIES.includes(category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}.`);
  }

  return errors;
}

function validatePrice({ price }) {
  const errors = [];

  if (price === undefined || price === null || price === '') {
    errors.push('Price is required.');
  } else if (typeof price !== 'number' || isNaN(price)) {
    errors.push('Price must be a number.');
  } else if (price < 0) {
    errors.push('Price must be 0 or greater.');
  }

  return errors;
}

function validateBicycle({ name }) {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters.');
  }
  if (name && name.trim().length > 100) {
    errors.push('Name must not exceed 100 characters.');
  }

  return errors;
}

function validateBicycleComponent({ component_id, quantity }) {
  const errors = [];

  if (!component_id || !Number.isInteger(Number(component_id))) {
    errors.push('component_id is required and must be a valid integer.');
  }
  if (quantity !== undefined) {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      errors.push('Quantity must be a whole number of at least 1.');
    }
  }

  return errors;
}

module.exports = {
  validateComponent,
  validatePrice,
  validateBicycle,
  validateBicycleComponent,
  VALID_CATEGORIES
};
