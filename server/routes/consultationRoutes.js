import express from 'express';
import {
  createConsultation,
  getMyConsultations,
  getAllConsultations,
  getConsultationById,
  createConsultationValidation,
} from '../controllers/consultationController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, allowRoles('client'), createConsultationValidation, createConsultation);
router.get('/my', protect, allowRoles('client'), getMyConsultations);
router.get('/', protect, allowRoles('admin'), getAllConsultations);
router.get('/:id', protect, getConsultationById);

export default router;
