import express from 'express';
import {
  createConsultation,
  getMyConsultations,
  getAllConsultations,
  getConsultationById,
  downloadConsultationAttachment,
  createConsultationValidation,
} from '../controllers/consultationController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';
import { uploadConsultationAttachments } from '../middleware/consultationUpload.js';

const router = express.Router();

router.post(
  '/',
  protect,
  allowRoles('client'),
  uploadConsultationAttachments,
  createConsultationValidation,
  createConsultation
);
router.get('/my', protect, allowRoles('client'), getMyConsultations);
router.get('/', protect, allowRoles('admin'), getAllConsultations);
router.get('/:id/attachments/:filename', protect, downloadConsultationAttachment);
router.get('/:id', protect, getConsultationById);

export default router;
