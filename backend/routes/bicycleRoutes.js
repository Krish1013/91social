const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bicycleController');

// Bicycle CRUD
router.get('/',     ctrl.listBicycles);
router.post('/',    ctrl.createBicycle);
router.get('/:id',  ctrl.getBicycle);
router.put('/:id',  ctrl.updateBicycle);
router.delete('/:id', ctrl.deleteBicycle);

// Pricing endpoint (before /:id/components to avoid ambiguity)
router.get('/:id/pricing', ctrl.getPricing);

// Bicycle component management
router.post('/:id/components',                       ctrl.addComponent);
router.put('/:id/components/:componentId',           ctrl.updateComponentQuantity);
router.delete('/:id/components/:componentId',        ctrl.removeComponent);

module.exports = router;
