import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import { uploadFolder } from '../middleware/uploadMiddleware.js';

const categories = ['Residential', 'Commercial', 'Interior', 'Landscape', 'Other'];
const statuses = ['completed', 'ongoing'];

export const createProjectValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(categories).withMessage('Category must be one of: ' + categories.join(', ')),
  body('status').optional().isIn(statuses).withMessage('Status must be completed or ongoing'),
  body('location').optional().isString().withMessage('Location must be text'),
  body('year').optional().isInt({ min: 1900, max: 2100 }).withMessage('Year must be a valid year'),
];

export const updateProjectValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('category').optional().isIn(categories).withMessage('Category must be one of: ' + categories.join(', ')),
  body('status').optional().isIn(statuses).withMessage('Status must be completed or ongoing'),
  body('location').optional().isString().withMessage('Location must be text'),
  body('year').optional().isInt({ min: 1900, max: 2100 }).withMessage('Year must be a valid year'),
];

const pickFields = (data) => {
  const fields = {};
  const allowed = ['title', 'description', 'category', 'status', 'location', 'year'];

  allowed.forEach((key) => {
    if (data[key] !== undefined) {
      fields[key] = data[key];
    }
  });

  return fields;
};

const getImagePaths = (files) => {
  if (!files) return [];

  return files.map((file) => '/uploads/projects/' + file.filename);
};

const removeImageFile = (imagePath) => {
  const filePath = path.join(uploadFolder, path.basename(imagePath));

  fs.unlink(filePath, () => {});
};

const removeUploadedFiles = (files) => {
  if (!files) return;

  files.forEach((file) => removeImageFile(file.filename));
};

export const getProjects = async (req, res) => {
  const filter = {};

  if (req.query.category) {
    filter.category = String(req.query.category);
  }

  if (req.query.status) {
    filter.status = String(req.query.status);
  }

  const projects = await Project.find(filter).sort({ createdAt: -1 });

  res.json(projects);
};

export const getProjectById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  res.json(project);
};

export const createProject = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    removeUploadedFiles(req.files);
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  let project;

  try {
    project = await Project.create({
      ...pickFields(req.body),
      images: getImagePaths(req.files),
      createdBy: req.user._id,
    });
  } catch (error) {
    removeUploadedFiles(req.files);
    throw error;
  }

  res.status(201).json(project);
};

export const updateProject = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    removeUploadedFiles(req.files);
    return res.status(404).json({ message: 'Project not found' });
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    removeUploadedFiles(req.files);
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    removeUploadedFiles(req.files);
    return res.status(404).json({ message: 'Project not found' });
  }

  project.set(pickFields(req.body));
  project.images.push(...getImagePaths(req.files));

  try {
    await project.save();
  } catch (error) {
    removeUploadedFiles(req.files);
    throw error;
  }

  res.json(project);
};

export const deleteProjectImage = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const imagePath = req.body.path;

  if (!imagePath) {
    return res.status(400).json({ message: 'Image path is required' });
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  if (!project.images.includes(imagePath)) {
    return res.status(404).json({ message: 'Image not found on this project' });
  }

  project.images = project.images.filter((image) => image !== imagePath);
  await project.save();

  removeImageFile(imagePath);

  res.json(project);
};

export const deleteProject = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  project.images.forEach((image) => removeImageFile(image));

  res.json({ message: 'Project deleted successfully' });
};
