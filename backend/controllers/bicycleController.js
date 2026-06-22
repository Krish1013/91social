const bicycleService = require('../services/bicycleService');
const pricingService = require('../services/pricingService');

async function listBicycles(req, res, next) {
  try {
    const bicycles = await bicycleService.listBicycles();
    res.json({ data: bicycles, count: bicycles.length });
  } catch (err) { next(err); }
}

async function getBicycle(req, res, next) {
  try {
    const bicycle = await bicycleService.getBicycle(Number(req.params.id));
    res.json({ data: bicycle });
  } catch (err) { next(err); }
}

async function createBicycle(req, res, next) {
  try {
    const bicycle = await bicycleService.createBicycle(req.body);
    res.status(201).json({ data: bicycle, message: 'Bicycle created successfully.' });
  } catch (err) { next(err); }
}

async function updateBicycle(req, res, next) {
  try {
    const bicycle = await bicycleService.updateBicycle(Number(req.params.id), req.body);
    res.json({ data: bicycle, message: 'Bicycle updated successfully.' });
  } catch (err) { next(err); }
}

async function deleteBicycle(req, res, next) {
  try {
    const result = await bicycleService.deleteBicycle(Number(req.params.id));
    res.json(result);
  } catch (err) { next(err); }
}

async function addComponent(req, res, next) {
  try {
    const result = await bicycleService.addComponent(Number(req.params.id), req.body);
    res.status(201).json({ data: result, message: 'Component added to bicycle.' });
  } catch (err) { next(err); }
}

async function updateComponentQuantity(req, res, next) {
  try {
    const result = await bicycleService.updateComponentQuantity(Number(req.params.id), Number(req.params.componentId), req.body);
    res.json({ data: result, message: 'Quantity updated.' });
  } catch (err) { next(err); }
}

async function removeComponent(req, res, next) {
  try {
    const result = await bicycleService.removeComponent(Number(req.params.id), Number(req.params.componentId));
    res.json(result);
  } catch (err) { next(err); }
}

async function getPricing(req, res, next) {
  try {
    const pricing = await pricingService.calculateBicyclePrice(Number(req.params.id));
    res.json({ data: pricing });
  } catch (err) { next(err); }
}

module.exports = { listBicycles, getBicycle, createBicycle, updateBicycle, deleteBicycle, addComponent, updateComponentQuantity, removeComponent, getPricing };
