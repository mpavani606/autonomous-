const { dashboardStats } = require('../utils/demoData');

const getDashboard = async (req, res) => {
  res.json({
    message: 'Dashboard loaded successfully',
    data: dashboardStats,
  });
};

module.exports = { getDashboard };
