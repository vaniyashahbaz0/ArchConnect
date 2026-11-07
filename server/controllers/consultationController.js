import path from 'path';
import fs from 'fs';
import { body, validationResult } from 'express-validator';
import Consultation from '../models/Consultation.js';
import {
  consultationUploadFolder,
  removeUploadedConsultationFiles,
} from '../middleware/consultationUpload.js';

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
    if (data[key] !== undefined && data[key] !== '') {
      fields[key] = data[key];
    }
  });

  return fields;
};

const getOwnerId = (consultation) => {
  if (consultation.client && consultation.client._id) {
    return consultation.client._id.toString();
  }

  return consultation.client.toString();
};

const getAttachmentsFromFiles = (files) => {
  if (!files) return [];

  return files.map((file) => ({
    originalName: file.originalname,
    filename: file.filename,
    mimeType: file.mimetype,
    size: file.size,
  }));
};

export const createConsultation = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    removeUploadedConsultationFiles(req.files);
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  let consultation;

  try {
    consultation = await Consultation.create({
      ...pickConsultationFields(req.body),
      attachments: getAttachmentsFromFiles(req.files),
      client: req.user._id,
    });
  } catch (error) {
    removeUploadedConsultationFiles(req.files);
    throw error;
  }

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

  const isOwner = getOwnerId(consultation) === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Access denied for your role' });
  }

  res.json(consultation);
};

export const downloadConsultationAttachment = async (req, res) => {
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
    return res.status(404).json({ message: 'Consultation not found' });
  }

  const consultation = await Consultation.findById(req.params.id);

  if (!consultation) {
    return res.status(404).json({ message: 'Consultation not found' });
  }

  const isOwner = getOwnerId(consultation) === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Access denied for your role' });
  }

  const requestedName = path.basename(req.params.filename);
  const attachment = consultation.attachments.find((file) => file.filename === requestedName);

  if (!attachment) {
    return res.status(404).json({ message: 'File not found' });
  }

  const filePath = path.join(consultationUploadFolder, requestedName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  res.download(filePath, attachment.originalName);
};
