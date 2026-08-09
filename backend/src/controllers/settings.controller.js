import SettingsService from '../services/settings.service.js';

class SettingsController {
  async getSettings(req, res, next) {
    try {
      const data = await SettingsService.getSettings(req.user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const data = await SettingsService.updateSettings(req.user, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async listApiKeys(req, res, next) {
    try {
      const data = await SettingsService.listApiKeys(req.user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createApiKey(req, res, next) {
    try {
      const data = await SettingsService.createApiKey(req.user, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async revokeApiKey(req, res, next) {
    try {
      const data = await SettingsService.revokeApiKey(req.user, req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async deleteApiKey(req, res, next) {
    try {
      await SettingsService.deleteApiKey(req.user, req.params.id);
      res.json({ success: true, message: 'API Key deleted.' });
    } catch (err) {
      next(err);
    }
  }

  async getMaintenanceConfig(req, res, next) {
    try {
      const data = await SettingsService.getMaintenanceConfig();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateMaintenanceConfig(req, res, next) {
    try {
      const data = await SettingsService.updateMaintenanceConfig(req.user, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

export default new SettingsController();
