import DocumentService from '../services/document.service.js';

class DocumentController {
  async searchDocuments(req, res, next) {
    try {
      const data = await DocumentService.searchDocuments(req.user, req.query);
      return res.status(200).json({
        success: true,
        message: 'Documents list retrieved successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const data = await DocumentService.downloadDocument(req.user, req.params.id); // Validates access first
      const doc = await DocumentService.searchDocuments(req.user, { id: req.params.id });
      // We can reuse getById details
      return res.status(200).json({
        success: true,
        message: 'Document details retrieved.',
        data: doc
      });
    } catch (err) {
      next(err);
    }
  }

  async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file was supplied for upload.' });
      }
      const data = await DocumentService.uploadDocument(req.user, req.file, req.body);
      return res.status(201).json({
        success: true,
        message: 'Document uploaded successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async uploadNewRevision(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file revision was supplied.' });
      }
      const data = await DocumentService.uploadNewRevision(req.user, req.params.id, req.file);
      return res.status(200).json({
        success: true,
        message: 'New revision uploaded successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async downloadDocument(req, res, next) {
    try {
      const { stream, originalFilename, mimeType } = await DocumentService.downloadDocument(
        req.user,
        req.params.id,
        req.query.version
      );

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${originalFilename}"`);
      return stream.pipe(res);
    } catch (err) {
      next(err);
    }
  }

  async previewDocument(req, res, next) {
    try {
      const { stream, originalFilename, mimeType } = await DocumentService.previewDocument(
        req.user,
        req.params.id,
        req.query.version
      );

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${originalFilename}"`);
      return stream.pipe(res);
    } catch (err) {
      next(err);
    }
  }

  async bulkDownloadZip(req, res, next) {
    try {
      const { documentIds } = req.body;
      if (!documentIds || !Array.isArray(documentIds)) {
        return res.status(400).json({ success: false, message: 'Invalid list of document IDs.' });
      }

      const zipStream = await DocumentService.bulkDownloadZip(req.user, documentIds);

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="bulk-export-${Date.now()}.zip"`);
      return zipStream.pipe(res);
    } catch (err) {
      next(err);
    }
  }

  async archiveDocument(req, res, next) {
    try {
      const data = await DocumentService.archiveDocument(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Document status changed to ARCHIVED.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async restoreDocument(req, res, next) {
    try {
      const data = await DocumentService.restoreDocument(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Document status changed to ACTIVE.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async softDeleteDocument(req, res, next) {
    try {
      await DocumentService.softDeleteDocument(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Document soft-deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new DocumentController();
