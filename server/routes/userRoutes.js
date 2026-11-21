import express from 'express';
import { getClients, getClientById } from '../controllers/userController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(allowRoles('admin'));

router.get('/clients', getClients);
router.get('/clients/:id', getClientById);

export default router;
