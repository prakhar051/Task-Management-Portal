import VendorRepository from '../repositories/vendor.repository.js';
import ActivityService from './activity.service.js';

class VendorService {
  async createVendor(user, data) {
    const vendor = await VendorRepository.create(data);
    await ActivityService.logActivity({
      userId: user.id,
      action: 'CREATE',
      entityType: 'VENDOR',
      entityId: vendor.id,
      description: `Registered new vendor profile: ${vendor.name}`
    });
    return vendor;
  }

  async updateVendor(user, id, data) {
    const vendor = await VendorRepository.update(id, data);
    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'VENDOR',
      entityId: id,
      description: `Modified vendor profile details for: ${vendor.name}`
    });
    return vendor;
  }

  async getVendorById(user, id) {
    return VendorRepository.getById(id);
  }

  async listVendors(user) {
    return VendorRepository.list();
  }

  async deleteVendor(user, id) {
    const vendor = await VendorRepository.getById(id);
    await VendorRepository.delete(id);
    await ActivityService.logActivity({
      userId: user.id,
      action: 'DELETE',
      entityType: 'VENDOR',
      entityId: id,
      description: `Deleted vendor: ${vendor?.name || id}`
    });
  }
}

export default new VendorService();
