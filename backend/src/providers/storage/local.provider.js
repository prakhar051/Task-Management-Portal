import fs from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import StorageProvider from './storage.provider.js';

class LocalStorageProvider extends StorageProvider {
  constructor() {
    super();
    // Resolve upload directory path
    this.uploadDir = path.resolve('uploads');
    this.ensureDirectoryExists();
  }

  async ensureDirectoryExists() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (err) {
      console.error('[LocalStorageProvider] Directory creation failed:', err);
    }
  }

  /**
   * Helper to compute SHA256 checksum of file buffer.
   */
  computeChecksum(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  async upload(file) {
    const checksum = this.computeChecksum(file.buffer);
    const storedFilename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${path.extname(file.originalname)}`;
    const destinationPath = path.join(this.uploadDir, storedFilename);

    await fs.writeFile(destinationPath, file.buffer);

    return {
      storedFilename,
      filePath: destinationPath,
      checksum
    };
  }

  async download(storedFilename) {
    const filePath = path.join(this.uploadDir, storedFilename);
    if (!existsSync(filePath)) {
      throw new Error(`File not found in storage: ${storedFilename}`);
    }
    return createReadStream(filePath);
  }

  async delete(storedFilename) {
    const filePath = path.join(this.uploadDir, storedFilename);
    if (existsSync(filePath)) {
      await fs.unlink(filePath);
      return true;
    }
    return false;
  }

  async exists(storedFilename) {
    const filePath = path.join(this.uploadDir, storedFilename);
    return existsSync(filePath);
  }
}

export default new LocalStorageProvider();
