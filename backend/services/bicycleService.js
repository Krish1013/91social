const bicycleRepository = require('../repositories/bicycleRepository');
const bicycleComponentRepository = require('../repositories/bicycleComponentRepository');
const componentRepository = require('../repositories/componentRepository');
const { validateBicycle, validateBicycleComponent } = require('../utils/validation');
const { createError } = require('../middleware/errorHandler');

async function listBicycles() {
  return bicycleRepository.findAll();
}

async function getBicycle(id) {
  const bicycle = await bicycleRepository.findById(id);
  if (!bicycle) throw createError(404, 'Bicycle not found', 'NOT_FOUND');
  const components = await bicycleComponentRepository.findByBicycleId(id);
  return { ...bicycle, components };
}

async function createBicycle(body) {
  const errors = validateBicycle(body);
  if (errors.length) throw createError(400, errors.join(' '), 'VALIDATION_ERROR');
  return bicycleRepository.create({ name: body.name.trim(), description: body.description?.trim() || null });
}

async function updateBicycle(id, body) {
  const existing = await bicycleRepository.findById(id);
  if (!existing) throw createError(404, 'Bicycle not found', 'NOT_FOUND');
  const errors = validateBicycle(body);
  if (errors.length) throw createError(400, errors.join(' '), 'VALIDATION_ERROR');
  return bicycleRepository.update(id, { name: body.name.trim(), description: body.description?.trim() || null });
}

async function deleteBicycle(id) {
  const existing = await bicycleRepository.findById(id);
  if (!existing) throw createError(404, 'Bicycle not found', 'NOT_FOUND');
  await bicycleRepository.remove(id);
  return { message: 'Bicycle deleted successfully.' };
}

async function addComponent(bicycleId, body) {
  const bicycle = await bicycleRepository.findById(bicycleId);
  if (!bicycle) throw createError(404, 'Bicycle not found', 'NOT_FOUND');

  const errors = validateBicycleComponent(body);
  if (errors.length) throw createError(400, errors.join(' '), 'VALIDATION_ERROR');

  const { component_id, quantity = 1 } = body;
  const component = await componentRepository.findById(component_id);
  if (!component) throw createError(404, 'Component not found', 'NOT_FOUND');
  if (!Number(component.is_active)) throw createError(400, 'Cannot add a deactivated component.', 'INACTIVE_COMPONENT');

  return bicycleComponentRepository.upsert(bicycleId, component_id, Number(quantity));
}

async function updateComponentQuantity(bicycleId, componentId, body) {
  const { quantity } = body;
  const errors = validateBicycleComponent({ component_id: componentId, quantity });
  if (errors.length) throw createError(400, errors.join(' '), 'VALIDATION_ERROR');

  const exists = await bicycleComponentRepository.findOne(bicycleId, componentId);
  if (!exists) throw createError(404, 'Component not found in this bicycle.', 'NOT_FOUND');

  await bicycleComponentRepository.updateQuantity(bicycleId, componentId, Number(quantity));
  return bicycleComponentRepository.findOne(bicycleId, componentId);
}

async function removeComponent(bicycleId, componentId) {
  const exists = await bicycleComponentRepository.findOne(bicycleId, componentId);
  if (!exists) throw createError(404, 'Component not found in this bicycle.', 'NOT_FOUND');
  await bicycleComponentRepository.remove(bicycleId, componentId);
  return { message: 'Component removed from bicycle.' };
}

module.exports = { listBicycles, getBicycle, createBicycle, updateBicycle, deleteBicycle, addComponent, updateComponentQuantity, removeComponent };
