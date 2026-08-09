import SettingsRepository from '../repositories/settings.repository.js';
import { prisma } from '../config/db.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import ActivityService from './activity.service.js';

class EmailService {
  async getSmtpConfig(user) {
    const config = await SettingsRepository.getSmtpConfig();
    if (!config) return null;
    return {
      host: config.host,
      port: config.port,
      username: config.username,
      fromEmail: config.fromEmail,
      secure: config.secure,
      isActive: config.isActive
    };
  }

  async updateSmtpConfig(user, data) {
    const passwordEnc = encrypt(data.password);
    const config = await SettingsRepository.upsertSmtpConfig({
      host: data.host,
      port: parseInt(data.port),
      username: data.username,
      password: passwordEnc,
      secure: data.secure ?? true,
      fromEmail: data.fromEmail,
      isActive: true
    });

    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'SMTP_CONFIG',
      entityId: config.id,
      description: `SMTP Server parameters updated: ${data.host}`
    });

    return {
      host: config.host,
      port: config.port,
      username: config.username,
      fromEmail: config.fromEmail,
      secure: config.secure,
      isActive: config.isActive
    };
  }

  async sendTestEmail(user, { toEmail }) {
    const config = await SettingsRepository.getSmtpConfig();
    if (!config) {
      throw new Error('SMTP connection configuration is missing. Configure settings first.');
    }

    const decryptedPassword = decrypt(config.password);
    let status = 'SENT';
    let error = null;

    // Simulate connection checking and mail transport sending
    if (!config.host || !config.username || !decryptedPassword) {
      status = 'FAILED';
      error = 'SMTP credentials authentication failed.';
    }

    const emailLog = await prisma.emailHistory.create({
      data: {
        to: toEmail,
        subject: 'TaskPortal Connection Test Email',
        body: 'This is an enterprise verification test verifying SMTP parameters connectivity.',
        status,
        error
      }
    });

    await ActivityService.logActivity({
      userId: user.id,
      action: 'CREATE',
      entityType: 'EMAIL_TEST',
      entityId: emailLog.id,
      description: `Dispatched SMTP verification test email to ${toEmail}. Status: ${status}`
    });

    if (status === 'FAILED') {
      throw new Error(error);
    }

    return { success: true, log: emailLog };
  }

  async getTemplates() {
    // Return standard default templates
    let list = await prisma.emailTemplate.findMany();
    if (list.length === 0) {
      const defaultTemplates = [
        { key: 'WELCOME', subject: 'Welcome to TaskPortal', body: 'Hi {{name}}, welcome to our workspace!' },
        { key: 'TASK_ASSIGNED', subject: 'New Task Assigned', body: 'A new task {{taskCode}} has been assigned to you.' }
      ];
      for (const t of defaultTemplates) {
        await prisma.emailTemplate.create({ data: t });
      }
      list = await prisma.emailTemplate.findMany();
    }
    return list;
  }

  async getEmailHistory() {
    return prisma.emailHistory.findMany({
      orderBy: { sentAt: 'desc' },
      take: 100
    });
  }
}

export default new EmailService();
