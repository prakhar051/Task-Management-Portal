import FeatureFlagService from '../services/featureFlag.service.js';

class FeatureFlagController {
  async createFlag(req, res, next) {
    try {
      const data = await FeatureFlagService.createFlag(req.user, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateFlag(req, res, next) {
    try {
      const data = await FeatureFlagService.updateFlag(req.user, req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async deleteFlag(req, res, next) {
    try {
      await FeatureFlagService.deleteFlag(req.user, req.params.id);
      res.json({ success: true, message: 'Feature flag deleted.' });
    } catch (err) {
      next(err);
    }
  }

  async listFlags(req, res, next) {
    try {
      const data = await FeatureFlagService.listFlags(req.user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

export default new FeatureFlagController();
