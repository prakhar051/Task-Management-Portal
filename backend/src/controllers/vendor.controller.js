import VendorService from '../services/vendor.service.js';

class VendorController {
  async createVendor(req, res, next) {
    try {
      const data = await VendorService.createVendor(req.user, req.body);
      return res.status(201).json({
        success: true,
        message: 'Vendor profile registered.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async updateVendor(req, res, next) {
    try {
      const data = await VendorService.updateVendor(req.user, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Vendor profile details updated.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getVendorById(req, res, next) {
    try {
      const data = await VendorService.getVendorById(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Vendor details.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async listVendors(req, res, next) {
    try {
      const data = await VendorService.listVendors(req.user);
      return res.status(200).json({
        success: true,
        message: 'Vendors directory list.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteVendor(req, res, next) {
    try {
      await VendorService.deleteVendor(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Vendor record deleted from directory.'
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new VendorController();
