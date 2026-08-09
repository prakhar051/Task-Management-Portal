import FeatureFlagRepository from '../repositories/featureFlag.repository.js';
import ActivityService from './activity.service.js';

class FeatureFlagService {
  constructor() {
    this.cache = new Map();
  }

  async loadCache() {
    try {
      const list = await FeatureFlagRepository.listFlags();
      this.cache.clear();
      for (const flag of list) {
        this.cache.set(flag.key, flag);
      }
    } catch (err) {
      console.error('Failed to reload feature flags cache:', err.message);
    }
  }

  async createFlag(user, data) {
    const flag = await FeatureFlagRepository.createFlag(data);
    await this.loadCache();
    
    await ActivityService.logActivity({
      userId: user.id,
      action: 'CREATE',
      entityType: 'FEATURE_FLAG',
      entityId: flag.id,
      description: `Feature flag "${flag.key}" created.`
    });

    return flag;
  }

  async updateFlag(user, id, data) {
    const flag = await FeatureFlagRepository.updateFlag(id, data);
    await this.loadCache();

    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'FEATURE_FLAG',
      entityId: flag.id,
      description: `Feature flag "${flag.key}" updated.`,
      metadata: { status: data.status, data }
    });

    return flag;
  }

  async deleteFlag(user, id) {
    const flag = await FeatureFlagRepository.deleteFlag(id);
    await this.loadCache();

    await ActivityService.logActivity({
      userId: user.id,
      action: 'DELETE',
      entityType: 'FEATURE_FLAG',
      entityId: id,
      description: `Feature flag deleted: "${flag.key}".`
    });

    return flag;
  }

  async listFlags(user) {
    return FeatureFlagRepository.listFlags();
  }

  async checkEnabled(key, user = null) {
    // Lazy initialize cache if empty
    if (this.cache.size === 0) {
      await this.loadCache();
    }

    const flag = this.cache.get(key);
    if (!flag) return false;

    if (flag.status !== 'ENABLED') return false;

    // Check environment bounds
    if (flag.environment) {
      const activeEnv = process.env.NODE_ENV || 'development';
      if (flag.environment.toLowerCase() !== activeEnv.toLowerCase()) {
        return false;
      }
    }

    // Check role filters
    if (user && flag.roles && flag.roles.length > 0) {
      if (!flag.roles.includes(user.role)) {
        return false;
      }
    }

    return true;
  }
}

export default new FeatureFlagService();
