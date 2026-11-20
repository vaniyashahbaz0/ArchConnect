import express from 'express';
import { getClientDashboard } from '../controllers/dashboardController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/client', protect, allowRoles('client'), getClientDashboard);

export default router;
