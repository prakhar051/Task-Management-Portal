import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateUser } from '../middleware/auth.middleware.js';
import DocumentController from '../controllers/document.controller.js';

const router = Router();

// Setup Multer memory storage
const storage = multer.memoryStorage();

const ALLOWED_EXT = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.ppt', '.pptx', '.txt', '.zip'];
const BLOCKED_EXT = ['.exe', '.dll', '.bat', '.cmd', '.sh', '.msi'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (BLOCKED_EXT.includes(ext)) {
    return cb(new Error('MimeTypeError: Executable files are blocked for security.'), false);
  }

  if (!ALLOWED_EXT.includes(ext)) {
    return cb(new Error(`ExtensionError: File extension ${ext} is not supported.`), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB size limit
  fileFilter
});

// All routes require authentication
router.use(authenticateUser);

router.get('/', DocumentController.searchDocuments);
router.get('/:id', DocumentController.getById);
router.post('/', upload.single('file'), DocumentController.uploadDocument);
router.post('/:id/version', upload.single('file'), DocumentController.uploadNewRevision);
router.get('/:id/download', DocumentController.downloadDocument);
router.get('/:id/preview', DocumentController.previewDocument);
router.post('/bulk-download', DocumentController.bulkDownloadZip);
router.patch('/:id/archive', DocumentController.archiveDocument);
router.patch('/:id/restore', DocumentController.restoreDocument);
router.delete('/:id', DocumentController.softDeleteDocument);

export default router;
