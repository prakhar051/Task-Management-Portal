/**
 * Abstract class defining the contract for Storage Providers (Local, AWS S3, GCP Blob, etc.).
 */
class StorageProvider {
  /**
   * Uploads a file to the storage medium.
   * @param {Object} file - Express multer file object.
   * @returns {Promise<{storedFilename: string, filePath: string, checksum: string}>}
   */
  async upload(file) {
    throw new Error('Method upload() must be implemented.');
  }

  /**
   * Downloads/retrieves a file stream from storage.
   * @param {string} storedFilename - Filename in storage.
   * @returns {Promise<NodeJS.ReadableStream>}
   */
  async download(storedFilename) {
    throw new Error('Method download() must be implemented.');
  }

  /**
   * Deletes a file from storage.
   * @param {string} storedFilename - Filename in storage.
   * @returns {Promise<boolean>}
   */
  async delete(storedFilename) {
    throw new Error('Method delete() must be implemented.');
  }

  /**
   * Checks if a file exists in storage.
   * @param {string} storedFilename - Filename in storage.
   * @returns {Promise<boolean>}
   */
  async exists(storedFilename) {
    throw new Error('Method exists() must be implemented.');
  }
}

export default StorageProvider;
