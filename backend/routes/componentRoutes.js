const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/componentController');

// Categories helper (must be before /:id routes to avoid conflict)
router.get('/categories', ctrl.getCategories);

// Component CRUD
router.get('/',     ctrl.listComponents);
router.post('/',    ctrl.createComponent);
router.get('/:id',  ctrl.getComponent);
router.put('/:id',  ctrl.updateComponent);
router.delete('/:id', ctrl.deleteComponent);

// Price history
router.get('/:id/prices',  ctrl.getPriceHistory);
router.post('/:id/prices', ctrl.addPrice);

module.exports = router;
