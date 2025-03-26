// Swagger documentation can be found in src/config/swagger/docs/fileDocs.ts
import { Router } from 'express';
import { uploadFile, removeFile } from '../controllers/fileController';
import upload from '../../../utils/fileUpload';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /uploads - Upload an image file
router.post('/', authenticate, upload.single('file'), uploadFile);

// DELETE /uploads/:filename - Delete an uploaded file
router.delete('/:filename', authenticate, removeFile);

export default router; 