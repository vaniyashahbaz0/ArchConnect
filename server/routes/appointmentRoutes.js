import express from 'express';
import {
  createAppointment,
  getAvailableSlots,
  getMyAppointments,
  getAllAppointments,
  getAppointmentById,
  cancelAppointment,
  updateAppointmentStatus,
  createAppointmentValidation,
  availableValidation,
  listAppointmentsValidation,
} from '../controllers/appointmentController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, allowRoles('client'), createAppointmentValidation, createAppointment);
router.get('/available', protect, availableValidation, getAvailableSlots);
router.get('/my', protect, allowRoles('client'), getMyAppointments);
router.get('/', protect, allowRoles('admin'), listAppointmentsValidation, getAllAppointments);
router.get('/:id', protect, getAppointmentById);
router.patch('/:id/cancel', protect, allowRoles('client'), cancelAppointment);
router.patch('/:id/status', protect, allowRoles('admin'), updateAppointmentStatus);

export default router;
