import express from 'express';
import {
  createConsultation,
  getMyConsultations,
  getAllConsultations,
  getConsultationById,
  getAttachment,
  updateConsultationStatus,
  deleteConsultation,
  createConsultationValidation,
} from '../controllers/consultationController.js';
import { uploadConsultationFiles } from '../middleware/consultationUpload.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/',
  protect,
  allowRoles('client'),
  uploadConsultationFiles,
  createConsultationValidation,
  createConsultation
);
router.get('/my', protect, allowRoles('client'), getMyConsultations);
router.get('/', protect, allowRoles('admin'), getAllConsultations);
router.get('/:id/attachments/:fileName', protect, getAttachment);
router.get('/:id', protect, getConsultationById);
router.patch('/:id/status', protect, allowRoles('admin'), updateConsultationStatus);
router.delete('/:id', protect, deleteConsultation);

export default router;
