const express = require('express');
const { createAdmin, getAdminStats, getAdmins } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/stats', getAdminStats);
router.get('/admins', getAdmins);
router.post('/admins', createAdmin);

module.exports = router;
