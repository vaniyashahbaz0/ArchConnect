import fs from 'fs';
import path from 'path';
import { body, validationResult } from 'express-validator';
import { consultationFolder } from '../middleware/consultationUpload.js';
import Consultation from '../models/Consultation.js';
import { getStatusError } from '../utils/statusRules.js';

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

  return fields;
};

const statuses = ['Pending', 'Approved', 'Rejected', 'Completed'];

const isValidId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

const deleteFiles = async (fileNames) => {
  for (const fileName of fileNames) {
    try {
      await fs.promises.unlink(path.join(consultationFolder, path.basename(fileName)));
    } catch (error) {
      continue;
    }
  }
};

const isOwnerOrAdmin = (consultation, user) => {
  const ownerId = consultation.client._id ? consultation.client._id.toString() : consultation.client.toString();

  return ownerId === user._id.toString() || user.role === 'admin';
};

export const createConsultation = async (req, res) => {
  const uploadedFiles = req.files || [];
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    await deleteFiles(uploadedFiles.map((file) => file.filename));

    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  const attachments = uploadedFiles.map((file) => ({
    originalName: file.originalname,
    filename: file.filename,
    mimeType: file.mimetype,
    size: file.size,
  }));

  let consultation;

  try {
    consultation = await Consultation.create({
      ...pickConsultationFields(req.body),
      attachments,
      client: req.user._id,
    });
  } catch (error) {
    await deleteFiles(uploadedFiles.map((file) => file.filename));
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
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ message: 'Consultation not found' });
  }

  const consultation = await Consultation.findById(req.params.id).populate('client', 'name email');

  if (!consultation) {
    return res.status(404).json({ message: 'Consultation not found' });
  }

  if (!isOwnerOrAdmin(consultation, req.user)) {
    return res.status(403).json({ message: 'Access denied for your role' });
  }

  res.json(consultation);
};

export const getAttachment = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ message: 'Consultation not found' });
  }

  const consultation = await Consultation.findById(req.params.id);

  if (!consultation) {
    return res.status(404).json({ message: 'Consultation not found' });
  }

  if (!isOwnerOrAdmin(consultation, req.user)) {
    return res.status(403).json({ message: 'Access denied for your role' });
  }

  const attachment = consultation.attachments.find((file) => file.filename === req.params.fileName);

  if (!attachment) {
    return res.status(404).json({ message: 'Attachment not found' });
  }

  const filePath = path.join(consultationFolder, path.basename(attachment.filename));

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Attachment file is missing' });
  }

  res.download(filePath, attachment.originalName);
};

export const updateConsultationStatus = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ message: 'Consultation not found' });
  }

  const { status, adminNote } = req.body;

  if (!statuses.includes(status)) {
    return res.status(400).json({ message: 'Status must be one of: ' + statuses.join(', ') });
  }

  if (adminNote !== undefined && typeof adminNote !== 'string') {
    return res.status(400).json({ message: 'Admin note must be text' });
  }

  const consultation = await Consultation.findById(req.params.id);

  if (!consultation) {
    return res.status(404).json({ message: 'Consultation not found' });
  }

  const statusError = getStatusError('consultation', consultation.status, status);

  if (statusError) {
    return res.status(400).json({ message: statusError });
  }

  consultation.status = status;
  consultation.statusUpdatedAt = new Date();

  if (adminNote !== undefined) {
    consultation.adminNote = adminNote;
  }

  await consultation.save();

  res.json(consultation);
};

export const deleteConsultation = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ message: 'Consultation not found' });
  }

  const consultation = await Consultation.findById(req.params.id);

  if (!consultation) {
    return res.status(404).json({ message: 'Consultation not found' });
  }

  if (!isOwnerOrAdmin(consultation, req.user)) {
    return res.status(403).json({ message: 'Access denied for your role' });
  }

  if (req.user.role !== 'admin' && consultation.status !== 'Pending') {
    return res.status(403).json({ message: 'Only pending consultations can be deleted' });
  }

  await deleteFiles(consultation.attachments.map((file) => file.filename));
  await consultation.deleteOne();

  res.json({ message: 'Consultation deleted' });
};
