import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const consultationUploadFolder = path.join(currentDir, '..', 'uploads', 'consultations');

if (!fs.existsSync(consultationUploadFolder)) {
  fs.mkdirSync(consultationUploadFolder, { recursive: true });
}

const allowedTypes = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/acad': ['.dwg'],
  'application/x-dwg': ['.dwg'],
  'image/vnd.dwg': ['.dwg'],
  'application/dwg': ['.dwg'],
  'application/octet-stream': ['.dwg'],
};

const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx', '.dwg'];

export const removeUploadedConsultationFiles = (files) => {
  if (!files) return;

  files.forEach((file) => {
    const filePath = path.join(consultationUploadFolder, path.basename(file.filename || file));

    fs.unlink(filePath, () => {});
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, consultationUploadFolder);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = Date.now() + '-' + crypto.randomBytes(6).toString('hex') + extension;

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const validExtensions = allowedTypes[file.mimetype];
  const mimeMatches = validExtensions && validExtensions.includes(extension);
  const genericBinary = file.mimetype === 'application/octet-stream' && allowedExtensions.includes(extension);

  if (!allowedExtensions.includes(extension) || (!mimeMatches && !genericBinary)) {
    const error = new Error('Only pdf, jpg, jpeg, png, webp, doc, docx and dwg files are allowed');
    error.status = 400;
    return cb(error);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
});

export const uploadConsultationAttachments = (req, res, next) => {
  upload.array('attachments', 5)(req, res, (error) => {
    if (!error) {
      return next();
    }

    removeUploadedConsultationFiles(req.files);

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Each file must be 10MB or smaller' });
      }

      if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'You can upload a maximum of 5 files' });
      }

      return res.status(400).json({ message: error.message });
    }

    if (error.status === 400) {
      return res.status(400).json({ message: error.message });
    }

    next(error);
  });
};
