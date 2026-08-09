import { prisma } from '../config/db.js';

class SettingsRepository {
  async getSettings() {
    let settings = await prisma.organizationSetting.findFirst();
    if (!settings) {
      // Initialize with default template values
      settings = await prisma.organizationSetting.create({
        data: {
          companyName: 'TaskPortal Enterprise',
          timeZone: 'UTC',
          currency: 'USD'
        }
      });
    }
    return settings;
  }

  async updateSettings(data) {
    const current = await this.getSettings();
    return prisma.organizationSetting.update({
      where: { id: current.id },
      data
    });
  }

  async getSmtpConfig() {
    return prisma.smtpConfiguration.findFirst();
  }

  async upsertSmtpConfig(data) {
    const config = await this.getSmtpConfig();
    if (config) {
      return prisma.smtpConfiguration.update({
        where: { id: config.id },
        data
      });
    }
    return prisma.smtpConfiguration.create({
      data: { ...data, isActive: true }
    });
  }

  async getStorageConfig() {
    return prisma.storageConfiguration.findFirst();
  }

  async upsertStorageConfig(data) {
    const config = await this.getStorageConfig();
    if (config) {
      return prisma.storageConfiguration.update({
        where: { id: config.id },
        data
      });
    }
    return prisma.storageConfiguration.create({
      data: { ...data, isActive: true }
    });
  }

  async createApiKey(data) {
    return prisma.apiKey.create({ data });
  }

  async listApiKeys() {
    return prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async revokeApiKey(id) {
    return prisma.apiKey.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async deleteApiKey(id) {
    return prisma.apiKey.delete({
      where: { id }
    });
  }

  async findApiKeyByHash(keyHash) {
    return prisma.apiKey.findUnique({
      where: { keyHash }
    });
  }

  async getMaintenanceConfig() {
    let config = await prisma.maintenanceConfiguration.findFirst();
    if (!config) {
      config = await prisma.maintenanceConfiguration.create({
        data: {
          status: 'DISABLED'
        }
      });
    }
    return config;
  }

  async updateMaintenanceConfig(data) {
    const current = await this.getMaintenanceConfig();
    return prisma.maintenanceConfiguration.update({
      where: { id: current.id },
      data
    });
  }
}

export default new SettingsRepository();
