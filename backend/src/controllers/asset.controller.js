import AssetService from '../services/asset.service.js';

class AssetController {
  async createAsset(req, res, next) {
    try {
      const data = await AssetService.createAsset(req.user, req.body);
      return res.status(201).json({
        success: true,
        message: 'Asset details registered in inventory.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async updateAsset(req, res, next) {
    try {
      const data = await AssetService.updateAsset(req.user, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Asset inventory details updated.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getAssetById(req, res, next) {
    try {
      const data = await AssetService.getAssetById(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Asset inventory specifications.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async listAssets(req, res, next) {
    try {
      const data = await AssetService.listAssets(req.user);
      return res.status(200).json({
        success: true,
        message: 'Inventory assets catalogue.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteAsset(req, res, next) {
    try {
      await AssetService.deleteAsset(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Asset removed from inventory catalogue.'
      });
    } catch (err) {
      next(err);
    }
  }

  async assignAsset(req, res, next) {
    try {
      const data = await AssetService.assignAsset(req.user, req.body);
      return res.status(200).json({
        success: true,
        message: 'Hardware asset assigned successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async returnAsset(req, res, next) {
    try {
      const data = await AssetService.returnAsset(req.user, req.params.assignmentId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Hardware asset return registered.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async transferAsset(req, res, next) {
    try {
      const data = await AssetService.transferAsset(req.user, req.body);
      return res.status(200).json({
        success: true,
        message: 'Asset assignment transferred.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async calculateDepreciation(req, res, next) {
    try {
      const { assetId, method, months } = req.body;
      const data = await AssetService.calculateDepreciation(req.user, assetId, method, months);
      return res.status(200).json({
        success: true,
        message: 'Monthly depreciation parameters calculated.',
        data
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new AssetController();
