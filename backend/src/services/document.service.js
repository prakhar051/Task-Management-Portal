import path from 'path';
import { ZipArchive } from 'archiver';
import DocumentRepository from '../repositories/document.repository.js';
import LocalStorageProvider from '../providers/storage/local.provider.js';
import NotificationService from './notification.service.js';
import ActivityService from './activity.service.js';
import { prisma } from '../config/db.js';

class DocumentService {
  async getEmployeeByUserId(userId) {
    const emp = await prisma.employee.findUnique({
      where: { userId }
    });
    if (!emp) throw new Error('Employee profile not found.');
    return emp;
  }

  /**
   * Helper to verify if user has access to a document.
   */
  async verifyAccess(user, doc) {
    if (user.role === 'ADMIN') return true;

    const emp = await this.getEmployeeByUserId(user.id);

    if (user.role === 'MANAGER') {
      // Manage own, department, or general docs
      if (doc.uploadedById === emp.id) return true;
      
      // Check if document belongs to employee in manager's department
      const docUploader = await prisma.employee.findUnique({
        where: { id: doc.uploadedById }
      });
      if (docUploader && docUploader.departmentId === emp.departmentId) return true;

      // Allow if entity has matching departmentId context
      if (doc.entityType === 'DEPARTMENT' && doc.entityId === emp.departmentId) return true;

      throw new Error('Unauthorized: You do not have permissions to access this document.');
    }

    if (user.role === 'EMPLOYEE') {
      // Read own or general/assigned resource documents
      if (doc.uploadedById === emp.id) return true;

      // Scoped permissions based on entity references:
      if (doc.entityType === 'EMPLOYEE' && doc.entityId === emp.id) return true;
      if (doc.entityType === 'DEPARTMENT' && doc.entityId === emp.departmentId) return true;

      throw new Error('Unauthorized: Access restricted to your own documents.');
    }
  }

  async uploadDocument(user, file, meta) {
    const emp = await this.getEmployeeByUserId(user.id);

    // Save binary stream locally
    const uploadResult = await LocalStorageProvider.upload(file);

    const doc = await DocumentRepository.createDocument({
      name: meta.name || file.originalname,
      entityType: meta.entityType || 'GENERAL',
      entityId: meta.entityId || null,
      category: meta.category || 'OTHER',
      status: 'ACTIVE',
      uploadedById: emp.id
    });

    const version = await DocumentRepository.createVersion({
      documentId: doc.id,
      versionNumber: 1,
      originalFilename: file.originalname,
      storedFilename: uploadResult.storedFilename,
      extension: path.extname(file.originalname).slice(1).toLowerCase(),
      mimeType: file.mimetype,
      fileSize: file.buffer.length,
      checksum: uploadResult.checksum,
      filePath: uploadResult.filePath,
      uploadedById: emp.id
    });

    // Notify employee (Non-blocking)
    await NotificationService.createNotification({
      userId: user.id,
      type: 'TASK_UPDATED',
      title: 'Document Uploaded',
      message: `Document "${doc.name}" has been uploaded successfully.`,
      priority: 'LOW',
      entityType: 'DOCUMENT',
      entityId: doc.id
    });

    // Log Activity
    await ActivityService.logActivity({
      userId: user.id,
      action: 'CREATE',
      entityType: 'DOCUMENT',
      entityId: doc.id,
      description: `Uploaded document: ${doc.name} (version 1)`,
      metadata: { after: doc }
    });

    return DocumentRepository.getById(doc.id);
  }

  async uploadNewRevision(user, documentId, file) {
    const doc = await DocumentRepository.getById(documentId);
    if (!doc) throw new Error('Document not found.');

    await this.verifyAccess(user, doc);
    const emp = await this.getEmployeeByUserId(user.id);

    // Save revision locally
    const uploadResult = await LocalStorageProvider.upload(file);

    // Determine new version index
    const latestVersion = doc.versions[0];
    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    const version = await DocumentRepository.createVersion({
      documentId: doc.id,
      versionNumber: newVersionNumber,
      originalFilename: file.originalname,
      storedFilename: uploadResult.storedFilename,
      extension: path.extname(file.originalname).slice(1).toLowerCase(),
      mimeType: file.mimetype,
      fileSize: file.buffer.length,
      checksum: uploadResult.checksum,
      filePath: uploadResult.filePath,
      uploadedById: emp.id
    });

    // Update document timestamp
    await DocumentRepository.updateDocument(doc.id, {
      updatedAt: new Date()
    });

    // Notify uploader
    await NotificationService.createNotification({
      userId: user.id,
      type: 'TASK_UPDATED',
      title: 'New Document Revision Uploaded',
      message: `Revision v${newVersionNumber} for "${doc.name}" was uploaded.`,
      priority: 'LOW',
      entityType: 'DOCUMENT',
      entityId: doc.id
    });

    // Log Activity
    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'DOCUMENT',
      entityId: doc.id,
      description: `Uploaded document revision v${newVersionNumber} for: ${doc.name}`,
      metadata: { after: version }
    });

    return DocumentRepository.getById(doc.id);
  }

  async downloadDocument(user, documentId, versionNumber) {
    const doc = await DocumentRepository.getById(documentId);
    if (!doc) throw new Error('Document not found.');

    await this.verifyAccess(user, doc);

    let version;
    if (versionNumber) {
      version = doc.versions.find((v) => v.versionNumber === parseInt(versionNumber));
    } else {
      version = doc.versions[0]; // Latest
    }

    if (!version) throw new Error('Requested document version not found.');

    const stream = await LocalStorageProvider.download(version.storedFilename);

    return {
      stream,
      originalFilename: version.originalFilename,
      mimeType: version.mimeType
    };
  }

  async previewDocument(user, documentId, versionNumber) {
    // Preview uses the same stream reading mechanics
    return this.downloadDocument(user, documentId, versionNumber);
  }

  async bulkDownloadZip(user, documentIds) {
    const archive = new ZipArchive({ zlib: { level: 9 } });

    // Enforce safety limits & lookup
    const docs = await DocumentRepository.bulkLookup(documentIds);

    for (const doc of docs) {
      try {
        await this.verifyAccess(user, doc);
        const version = doc.versions[0];
        if (version) {
          const fileStream = await LocalStorageProvider.download(version.storedFilename);
          archive.append(fileStream, { name: `${doc.name}-${version.versionNumber}.${version.extension}` });
        }
      } catch (err) {
        console.error(`Skipping file ID ${doc.id} in ZIP compilation:`, err.message);
      }
    }

    archive.finalize();
    return archive;
  }

  async softDeleteDocument(user, documentId) {
    const doc = await DocumentRepository.getById(documentId);
    if (!doc) throw new Error('Document not found.');

    await this.verifyAccess(user, doc);

    const deletedDoc = await DocumentRepository.softDelete(documentId);

    // Notify employee (Non-blocking)
    await NotificationService.createNotification({
      userId: user.id,
      type: 'TASK_UPDATED',
      title: 'Document Deleted',
      message: `Document "${doc.name}" was soft deleted.`,
      priority: 'LOW',
      entityType: 'DOCUMENT',
      entityId: doc.id
    });

    // Log Activity
    await ActivityService.logActivity({
      userId: user.id,
      action: 'DELETE',
      entityType: 'DOCUMENT',
      entityId: doc.id,
      description: `Soft deleted document: ${doc.name}`,
      metadata: { after: deletedDoc }
    });

    return deletedDoc;
  }

  async restoreDocument(user, documentId) {
    const doc = await prisma.document.findUnique({
      where: { id: documentId }
    });
    if (!doc) throw new Error('Document not found.');

    await this.verifyAccess(user, doc);

    const restoredDoc = await DocumentRepository.restore(documentId);

    // Notify employee
    await NotificationService.createNotification({
      userId: user.id,
      type: 'TASK_UPDATED',
      title: 'Document Restored',
      message: `Document "${doc.name}" was restored successfully.`,
      priority: 'LOW',
      entityType: 'DOCUMENT',
      entityId: doc.id
    });

    // Log Activity
    await ActivityService.logActivity({
      userId: user.id,
      action: 'RESTORE',
      entityType: 'DOCUMENT',
      entityId: doc.id,
      description: `Restored soft-deleted document: ${doc.name}`,
      metadata: { after: restoredDoc }
    });

    return restoredDoc;
  }

  async archiveDocument(user, documentId) {
    const doc = await DocumentRepository.getById(documentId);
    if (!doc) throw new Error('Document not found.');

    await this.verifyAccess(user, doc);

    const archivedDoc = await DocumentRepository.updateDocument(documentId, {
      status: 'ARCHIVED'
    });

    // Notify employee
    await NotificationService.createNotification({
      userId: user.id,
      type: 'TASK_UPDATED',
      title: 'Document Archived',
      message: `Document "${doc.name}" was archived.`,
      priority: 'LOW',
      entityType: 'DOCUMENT',
      entityId: doc.id
    });

    // Log Activity
    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'DOCUMENT',
      entityId: doc.id,
      description: `Archived document: ${doc.name}`,
      metadata: { after: archivedDoc }
    });

    return archivedDoc;
  }

  async searchDocuments(user, query = {}) {
    const { search = '', category, entityType, entityId, page, limit } = query;

    const where = {};

    if (category) where.category = category;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const emp = await this.getEmployeeByUserId(user.id);

    // Scopes filtering based on roles
    if (user.role === 'EMPLOYEE') {
      where.OR = [
        { uploadedById: emp.id },
        { entityType: 'EMPLOYEE', entityId: emp.id },
        { entityType: 'DEPARTMENT', entityId: emp.departmentId }
      ];
    } else if (user.role === 'MANAGER') {
      where.OR = [
        { uploadedById: emp.id },
        { uploadedBy: { departmentId: emp.departmentId } },
        { entityType: 'DEPARTMENT', entityId: emp.departmentId }
      ];
    }

    const pagination = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10
    };

    return DocumentRepository.search(where, search, pagination);
  }
}

export default new DocumentService();
