import express from 'express';
import { getClientDashboard, getAdminDashboard } from '../controllers/dashboardController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/client', protect, allowRoles('client'), getClientDashboard);
router.get('/admin', protect, allowRoles('admin'), getAdminDashboard);

export default router;
