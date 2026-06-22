const dashboardService = require('../services/dashboardService');

async function getDashboard(req, res, next) {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.json({ data: stats });
  } catch (err) { next(err); }
}

module.exports = { getDashboard };
