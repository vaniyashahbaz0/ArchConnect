import { body, validationResult } from 'express-validator';
import Consultation from '../models/Consultation.js';

const projectTypes = ['Residential', 'Commercial', 'Interior', 'Landscape', 'Renovation', 'Other'];

export const createConsultationValidation = [
  body('projectType').isIn(projectTypes).withMessage('Project type must be one of: ' + projectTypes.join(', ')),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a number'),
  body('location').optional().isString().withMessage('Location must be text'),
  body('preferredStartDate').optional().isISO8601().withMessage('Preferred start date must be a valid date'),
];

const pickConsultationFields = (data) => {
  const fields = {};
  const allowed = ['projectType', 'title', 'description', 'budget', 'location', 'preferredStartDate'];

  allowed.forEach((key) => {
    if (data[key] !== undefined) {
      fields[key] = data[key];
    }
  });

  if (Array.isArray(data.attachments)) {
    fields.attachments = data.attachments.map((file) => ({
      originalName: file.originalName,
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size,
    }));
  }

  return fields;
};

export const createConsultation = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  const consultation = await Consultation.create({
    ...pickConsultationFields(req.body),
    client: req.user._id,
  });

  res.status(201).json(consultation);
};

export const getMyConsultations = async (req, res) => {
  const consultations = await Consultation.find({ client: req.user._id }).sort({ createdAt: -1 });

  res.json(consultations);
};

export const getAllConsultations = async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.status = String(req.query.status);
  }

  const consultations = await Consultation.find(filter)
    .populate('client', 'name email')
    .sort({ createdAt: -1 });

  res.json(consultations);
};

export const getConsultationById = async (req, res) => {
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
    return res.status(404).json({ message: 'Consultation not found' });
  }

  const consultation = await Consultation.findById(req.params.id).populate('client', 'name email');

  if (!consultation) {
    return res.status(404).json({ message: 'Consultation not found' });
  }

  const ownerId = consultation.client._id ? consultation.client._id.toString() : consultation.client.toString();
  const isOwner = ownerId === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Access denied for your role' });
  }

  res.json(consultation);
};
