import BackupService from '../services/backup.service.js';

class BackupController {
  async triggerBackup(req, res, next) {
    try {
      const data = await BackupService.triggerBackup(req.user, 'MANUAL', req.body.scope || 'ALL');
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async listBackups(req, res, next) {
    try {
      const data = await BackupService.listBackups();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async restoreBackup(req, res, next) {
    try {
      const result = await BackupService.restoreBackup(req.user, req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export default new BackupController();
