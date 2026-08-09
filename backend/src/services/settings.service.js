import crypto from 'crypto';
import SettingsRepository from '../repositories/settings.repository.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import NotificationService from './notification.service.js';
import ActivityService from './activity.service.js';

class SettingsService {
  async getSettings(user) {
    return SettingsRepository.getSettings();
  }

  async updateSettings(user, data) {
    const updated = await SettingsRepository.updateSettings(data);
    
    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'ORGANIZATION',
      entityId: updated.id,
      description: 'Organization settings updated',
      metadata: { changes: data }
    });

    return updated;
  }

  async createApiKey(user, { name, description }) {
    const rawKey = `tp_live_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const valueEnc = encrypt(rawKey);

    const apiKey = await SettingsRepository.createApiKey({
      name,
      description,
      keyHash,
      valueEnc,
      isActive: true
    });

    await ActivityService.logActivity({
      userId: user.id,
      action: 'CREATE',
      entityType: 'API_KEY',
      entityId: apiKey.id,
      description: `Created API key: "${name}"`
    });

    // Return the raw key to the client once
    return { ...apiKey, rawKey };
  }

  async listApiKeys(user) {
    const list = await SettingsRepository.listApiKeys();
    return list.map((key) => ({
      id: key.id,
      name: key.name,
      description: key.description,
      isActive: key.isActive,
      createdAt: key.createdAt
    }));
  }

  async revokeApiKey(user, id) {
    const revoked = await SettingsRepository.revokeApiKey(id);
    
    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'API_KEY',
      entityId: id,
      description: `Revoked API key: "${revoked.name}"`
    });

    return revoked;
  }

  async deleteApiKey(user, id) {
    await SettingsRepository.deleteApiKey(id);
    
    await ActivityService.logActivity({
      userId: user.id,
      action: 'DELETE',
      entityType: 'API_KEY',
      entityId: id,
      description: `Deleted API key ID: ${id}`
    });
  }

  async validateApiKey(rawKey) {
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const key = await SettingsRepository.findApiKeyByHash(keyHash);
    if (!key || !key.isActive) {
      return false;
    }
    return true;
  }

  async getMaintenanceConfig() {
    return SettingsRepository.getMaintenanceConfig();
  }

  async updateMaintenanceConfig(user, data) {
    const config = await SettingsRepository.updateMaintenanceConfig(data);

    // Notify administrators/users
    const title = data.status === 'ENABLED' ? 'System Maintenance Mode Activated' : 'System Maintenance Completed';
    const message = data.status === 'ENABLED'
      ? `Maintenance Mode enabled. Message: "${data.message || ''}". ETA: ${data.eta ? new Date(data.eta).toLocaleString() : 'N/A'}`
      : 'System is back online. All services are restored.';

    await NotificationService.createNotification({
      userId: user.id,
      title,
      message,
      type: 'TASK_UPDATED',
      priority: 'HIGH',
      entityType: 'MAINTENANCE',
      entityId: config.id
    });

    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'MAINTENANCE',
      entityId: config.id,
      description: `Maintenance mode toggled to: ${data.status}`,
      metadata: { status: data.status, config }
    });

    return config;
  }
}

export default new SettingsService();
