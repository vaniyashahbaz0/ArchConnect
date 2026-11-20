import { body, query, validationResult } from 'express-validator';
import Appointment from '../models/Appointment.js';
import Consultation from '../models/Consultation.js';
import { getStatusError } from '../utils/statusRules.js';
import { notifyUser, notifyAdmins } from '../utils/createNotification.js';

const timeSlots = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
const meetingTypes = ['In Person', 'Online'];
const statuses = ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'];
const freeStatuses = ['Rejected', 'Cancelled'];

const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

const isValidId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

const toDay = (text) => new Date(text + 'T00:00:00.000Z');

const getToday = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return toDay(now.getFullYear() + '-' + month + '-' + day);
};

const isOwnerOrAdmin = (appointment, user) => {
  const ownerId = appointment.client._id ? appointment.client._id.toString() : appointment.client.toString();

  return ownerId === user._id.toString() || user.role === 'admin';
};

const hasErrors = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });

    return true;
  }

  return false;
};

export const createAppointmentValidation = [
  body('date')
    .matches(dateFormat)
    .withMessage('Date must be in YYYY-MM-DD format')
    .bail()
    .isISO8601({ strict: true })
    .withMessage('Date is not a valid date'),
  body('timeSlot').isIn(timeSlots).withMessage('Time slot must be one of: ' + timeSlots.join(', ')),
  body('meetingType').optional().isIn(meetingTypes).withMessage('Meeting type must be one of: ' + meetingTypes.join(', ')),
  body('notes').optional().isString().withMessage('Notes must be text'),
  body('consultation').optional().isMongoId().withMessage('Consultation id is not valid'),
];

export const availableValidation = [
  query('date')
    .matches(dateFormat)
    .withMessage('Date must be in YYYY-MM-DD format')
    .bail()
    .isISO8601({ strict: true })
    .withMessage('Date is not a valid date'),
];

export const listAppointmentsValidation = [
  query('status').optional().isIn(statuses).withMessage('Status must be one of: ' + statuses.join(', ')),
  query('date')
    .optional()
    .matches(dateFormat)
    .withMessage('Date must be in YYYY-MM-DD format')
    .bail()
    .isISO8601({ strict: true })
    .withMessage('Date is not a valid date'),
];

export const createAppointment = async (req, res) => {
  if (hasErrors(req, res)) return;

  const { timeSlot, meetingType, notes, consultation } = req.body;
  const date = toDay(req.body.date);

  if (date < getToday()) {
    return res.status(400).json({ message: 'You cannot book a date in the past' });
  }

  if (date.getUTCDay() === 0) {
    return res.status(400).json({ message: 'Appointments are not available on Sundays' });
  }

  if (consultation) {
    const foundConsultation = await Consultation.findById(consultation);

    if (!foundConsultation || foundConsultation.client.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Consultation not found for your account' });
    }
  }

  const taken = await Appointment.findOne({
    date,
    timeSlot,
    status: { $nin: freeStatuses },
  });

  if (taken) {
    return res.status(400).json({ message: 'That time slot is already booked' });
  }

  const appointment = await Appointment.create({
    client: req.user._id,
    consultation: consultation || undefined,
    date,
    timeSlot,
    meetingType,
    notes,
  });

  await notifyAdmins(
    'appointment',
    `New appointment booked by ${req.user.name}`,
    '/admin/appointments'
  );

  res.status(201).json(appointment);
};

export const getAvailableSlots = async (req, res) => {
  if (hasErrors(req, res)) return;

  const date = toDay(req.query.date);

  if (date < getToday() || date.getUTCDay() === 0) {
    return res.json({ date: req.query.date, availableSlots: [] });
  }

  const booked = await Appointment.find({
    date,
    status: { $nin: freeStatuses },
  }).select('timeSlot');

  const bookedSlots = booked.map((appointment) => appointment.timeSlot);
  const availableSlots = timeSlots.filter((slot) => !bookedSlots.includes(slot));

  res.json({ date: req.query.date, availableSlots });
};

export const getMyAppointments = async (req, res) => {
  const appointments = await Appointment.find({ client: req.user._id })
    .populate('consultation', 'title')
    .sort({ date: 1, timeSlot: 1 });

  res.json(appointments);
};

export const getAllAppointments = async (req, res) => {
  if (hasErrors(req, res)) return;

  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.date) {
    filter.date = toDay(req.query.date);
  }

  const appointments = await Appointment.find(filter)
    .populate('client', 'name email')
    .populate('consultation', 'title')
    .sort({ date: 1, timeSlot: 1 });

  res.json(appointments);
};

export const getAppointmentById = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const appointment = await Appointment.findById(req.params.id)
    .populate('client', 'name email')
    .populate('consultation', 'title');

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  if (!isOwnerOrAdmin(appointment, req.user)) {
    return res.status(403).json({ message: 'Access denied for your role' });
  }

  res.json(appointment);
};

export const cancelAppointment = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  if (appointment.client.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied for your role' });
  }

  if (appointment.status !== 'Pending' && appointment.status !== 'Approved') {
    return res.status(400).json({ message: 'Only pending or approved appointments can be cancelled' });
  }

  if (appointment.date < getToday()) {
    return res.status(400).json({ message: 'This appointment date has already passed' });
  }

  appointment.status = 'Cancelled';
  appointment.statusUpdatedAt = new Date();
  await appointment.save();

  await notifyAdmins(
    'appointment',
    `Appointment cancelled by ${req.user.name}`,
    '/admin/appointments'
  );

  res.json(appointment);
};

export const updateAppointmentStatus = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const { status, adminNote } = req.body;

  if (!statuses.includes(status)) {
    return res.status(400).json({ message: 'Status must be one of: ' + statuses.join(', ') });
  }

  if (adminNote !== undefined && typeof adminNote !== 'string') {
    return res.status(400).json({ message: 'Admin note must be text' });
  }

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const statusError = getStatusError('appointment', appointment.status, status);

  if (statusError) {
    return res.status(400).json({ message: statusError });
  }

  appointment.status = status;
  appointment.statusUpdatedAt = new Date();

  if (adminNote !== undefined) {
    appointment.adminNote = adminNote;
  }

  await appointment.save();

  if (req.user.role === 'admin') {
    await notifyUser(
      appointment.client,
      'appointment',
      `Your appointment status has been updated to ${status}`,
      '/appointments'
    );
  } else {
    await notifyAdmins(
      'appointment',
      `Appointment status updated to ${status} by ${req.user.name}`,
      '/admin/appointments'
    );
  }

  res.json(appointment);
};
