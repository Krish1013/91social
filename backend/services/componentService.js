const componentRepository = require('../repositories/componentRepository');
const priceRepository = require('../repositories/priceRepository');
const { validateComponent, validatePrice } = require('../utils/validation');
const { createError } = require('../middleware/errorHandler');

async function listComponents(includeInactive = false) {
  return componentRepository.findAll(includeInactive);
}

async function getComponent(id) {
  const component = await componentRepository.findById(id);
  if (!component) throw createError(404, 'Component not found', 'NOT_FOUND');
  const price_history = await priceRepository.getHistory(id);
  return { ...component, price_history };
}

async function createComponent(body) {
  const errors = validateComponent(body);
  if (errors.length) throw createError(400, errors.join(' '), 'VALIDATION_ERROR');

  const { name, category, description, initial_price } = body;
  const component = await componentRepository.create({ name: name.trim(), category, description: description?.trim() || null });

  if (initial_price !== undefined && initial_price !== null) {
    const priceErrors = validatePrice({ price: initial_price });
    if (priceErrors.length) throw createError(400, priceErrors.join(' '), 'VALIDATION_ERROR');
    await priceRepository.addPrice(component.id, { price: initial_price, notes: 'Initial price' });
  }

  return componentRepository.findById(component.id);
}

async function updateComponent(id, body) {
  const existing = await componentRepository.findById(id);
  if (!existing) throw createError(404, 'Component not found', 'NOT_FOUND');
  const errors = validateComponent(body);
  if (errors.length) throw createError(400, errors.join(' '), 'VALIDATION_ERROR');
  return componentRepository.update(id, { name: body.name.trim(), category: body.category, description: body.description?.trim() || null });
}

async function deleteComponent(id) {
  const existing = await componentRepository.findById(id);
  if (!existing) throw createError(404, 'Component not found', 'NOT_FOUND');
  await componentRepository.softDelete(id);
  return { message: 'Component deactivated successfully.' };
}

async function addPrice(componentId, body) {
  const component = await componentRepository.findById(componentId);
  if (!component) throw createError(404, 'Component not found', 'NOT_FOUND');
  const errors = validatePrice(body);
  if (errors.length) throw createError(400, errors.join(' '), 'VALIDATION_ERROR');
  return priceRepository.addPrice(componentId, body);
}

async function getPriceHistory(componentId) {
  const component = await componentRepository.findById(componentId);
  if (!component) throw createError(404, 'Component not found', 'NOT_FOUND');
  return priceRepository.getHistory(componentId);
}

function getCategories() {
  return componentRepository.getCategories();
}

module.exports = { listComponents, getComponent, createComponent, updateComponent, deleteComponent, addPrice, getPriceHistory, getCategories };
