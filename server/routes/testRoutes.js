import express from 'express';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/client', protect, (req, res) => {
  res.json({ message: `Hello ${req.user.name}, you are logged in as ${req.user.role}` });
});

router.get('/admin', protect, allowRoles('admin'), (req, res) => {
  res.json({ message: `Welcome admin ${req.user.name}` });
});

export default router;
