import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/avatars');
const ATTACHMENT_DIR = path.join(process.cwd(), 'public/uploads/attachments');

// Ensure directory structures are present
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(ATTACHMENT_DIR)) {
  fs.mkdirSync(ATTACHMENT_DIR, { recursive: true });
}

// Configure Storage Engine for Avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Configure Storage Engine for Task Attachments
const attachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ATTACHMENT_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `attachment-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Configure upload constraints (MIME type restrictions and file size limit)
const avatarFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP images are allowed.'), false);
  }
};

const attachmentFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip', 'application/x-zip-compressed',
    'text/plain'
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDF, Word, Excel, ZIP, and Text files are allowed.'), false);
  }
};

export const uploadAvatarMiddleware = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB size ceiling
  }
}).single('avatar');

export const uploadAttachmentMiddleware = multer({
  storage: attachmentStorage,
  fileFilter: attachmentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB size ceiling
  }
}).single('attachment');

/**
 * Enterprise Storage Service Abstraction
 * Decouples controller actions from underlying storage implementations.
 * Can be extended to support Cloudinary or AWS S3 by changing the methods.
 */
export class StorageService {
  /**
   * Saves uploaded file metadata and yields access endpoint path.
   * @param {Object} file - Express file object.
   * @returns {string} public path.
   */
  static saveFile(file) {
    if (!file) return null;
    return `/uploads/avatars/${file.filename}`;
  }

  /**
   * Deletes a file from local disk storage.
   * @param {string} fileUrl - Public access path.
   */
  static deleteFile(fileUrl) {
    if (!fileUrl) return;
    try {
      const fileName = path.basename(fileUrl);
      let filePath = path.join(UPLOAD_DIR, fileName);
      // Fallback check in attachments if not found in avatars
      if (!fs.existsSync(filePath)) {
        filePath = path.join(ATTACHMENT_DIR, fileName);
      }
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`StorageService failed deleting file at: ${fileUrl}`, error);
    }
  }
}

