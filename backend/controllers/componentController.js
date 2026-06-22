const componentService = require('../services/componentService');

async function listComponents(req, res, next) {
  try {
    const includeInactive = req.query.include_inactive === 'true';
    const components = await componentService.listComponents(includeInactive);
    res.json({ data: components, count: components.length });
  } catch (err) { next(err); }
}

async function getComponent(req, res, next) {
  try {
    const component = await componentService.getComponent(Number(req.params.id));
    res.json({ data: component });
  } catch (err) { next(err); }
}

async function createComponent(req, res, next) {
  try {
    const component = await componentService.createComponent(req.body);
    res.status(201).json({ data: component, message: 'Component created successfully.' });
  } catch (err) { next(err); }
}

async function updateComponent(req, res, next) {
  try {
    const component = await componentService.updateComponent(Number(req.params.id), req.body);
    res.json({ data: component, message: 'Component updated successfully.' });
  } catch (err) { next(err); }
}

async function deleteComponent(req, res, next) {
  try {
    const result = await componentService.deleteComponent(Number(req.params.id));
    res.json(result);
  } catch (err) { next(err); }
}

async function addPrice(req, res, next) {
  try {
    const price = await componentService.addPrice(Number(req.params.id), req.body);
    res.status(201).json({ data: price, message: 'Price added successfully.' });
  } catch (err) { next(err); }
}

async function getPriceHistory(req, res, next) {
  try {
    const history = await componentService.getPriceHistory(Number(req.params.id));
    res.json({ data: history, count: history.length });
  } catch (err) { next(err); }
}

async function getCategories(req, res, next) {
  try {
    const categories = componentService.getCategories();
    res.json({ data: categories });
  } catch (err) { next(err); }
}

module.exports = { listComponents, getComponent, createComponent, updateComponent, deleteComponent, addPrice, getPriceHistory, getCategories };
