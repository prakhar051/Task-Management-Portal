import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/avatars');

// Ensure directory structure is present
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename to prevent overwrites
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Configure upload constraints (MIME type restrictions and file size limit)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP images are allowed.'), false);
  }
};

export const uploadAvatarMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB size ceiling
  }
}).single('avatar');

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
    // Returns static file route path for express static server
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
      const filePath = path.join(UPLOAD_DIR, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`StorageService failed deleting file at: ${fileUrl}`, error);
    }
  }
}
