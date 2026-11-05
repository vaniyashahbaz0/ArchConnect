import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  deleteProjectImage,
  createProjectValidation,
  updateProjectValidation,
} from '../controllers/projectController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';
import { uploadProjectImages } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getProjects);
router.get('/:id', getProjectById);

router.post('/', protect, allowRoles('admin'), uploadProjectImages, createProjectValidation, createProject);
router.put('/:id', protect, allowRoles('admin'), uploadProjectImages, updateProjectValidation, updateProject);
router.delete('/:id/images', protect, allowRoles('admin'), deleteProjectImage);
router.delete('/:id', protect, allowRoles('admin'), deleteProject);

export default router;
