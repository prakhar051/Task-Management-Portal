import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const archiver = require('archiver');
import { prisma } from '../config/db.js';
import BackupRepository from '../repositories/backup.repository.js';
import NotificationService from './notification.service.js';
import ActivityService from './activity.service.js';

class BackupService {
  async triggerBackup(user, backupType = 'MANUAL', scope = 'ALL') {
    // 1. Create directory backup logs
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${scope.toLowerCase()}-${timestamp}.zip`;
    const filePath = path.join(backupsDir, filename);

    const logEntry = await BackupRepository.createBackup({
      filename,
      filePath,
      backupType,
      scope,
      status: 'IN_PROGRESS'
    });

    // Start packaging asynchronously
    this.runArchiving(logEntry.id, filePath, scope, user).catch((err) => {
      console.error(`Backup task ${logEntry.id} failed:`, err.message);
    });

    return logEntry;
  }

  async runArchiving(backupLogId, filePath, scope, user) {
    const output = fs.createWriteStream(filePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', async () => {
      const stats = fs.statSync(filePath);
      await BackupRepository.updateBackupStatus(backupLogId, 'SUCCESS', {
        sizeBytes: BigInt(stats.size)
      });

      if (user) {
        await NotificationService.createNotification({
          userId: user.id,
          title: 'System Backup Succeeded',
          message: `Your backup archive ${path.basename(filePath)} created successfully.`,
          type: 'TASK_COMPLETED',
          priority: 'HIGH',
          entityType: 'BACKUP',
          entityId: backupLogId
        });
      }
    });

    archive.on('error', async (err) => {
      await BackupRepository.updateBackupStatus(backupLogId, 'FAILED', {
        error: err.message
      });

      if (user) {
        await NotificationService.createNotification({
          userId: user.id,
          title: 'System Backup Failed',
          message: `System backup job failed: ${err.message}`,
          type: 'TASK_UPDATED',
          priority: 'HIGH',
          entityType: 'BACKUP',
          entityId: backupLogId
        });
      }
    });

    archive.pipe(output);

    // 1. Package Database Data as json dump
    if (scope === 'ALL' || scope === 'DATABASE') {
      try {
        const dbDump = {
          users: await prisma.user.findMany(),
          departments: await prisma.department.findMany(),
          employees: await prisma.employee.findMany(),
          projects: await prisma.project.findMany(),
          tasks: await prisma.task.findMany(),
          schemaVersion: '1.0'
        };
        archive.append(JSON.stringify(dbDump, null, 2), { name: 'database_dump.json' });
      } catch (err) {
        console.error('Failed to dump database logs:', err.message);
      }
    }

    // 2. Package uploaded documents folders
    if (scope === 'ALL' || scope === 'UPLOADS') {
      const uploadsDir = path.join(process.cwd(), 'public/uploads');
      if (fs.existsSync(uploadsDir)) {
        archive.directory(uploadsDir, 'uploads');
      }
      const rawUploadsDir = path.join(process.cwd(), 'uploads');
      if (fs.existsSync(rawUploadsDir)) {
        archive.directory(rawUploadsDir, 'raw_uploads');
      }
    }

    await archive.finalize();

    if (user) {
      await ActivityService.logActivity({
        userId: user.id,
        action: 'CREATE',
        entityType: 'BACKUP',
        entityId: backupLogId,
        description: `Executed system backup archive: ${path.basename(filePath)}`
      });
    }
  }

  async listBackups() {
    const list = await BackupRepository.listBackups();
    return list.map((b) => ({
      ...b,
      sizeBytes: b.sizeBytes ? b.sizeBytes.toString() : '0' // Serialize BigInt
    }));
  }

  async restoreBackup(user, id) {
    const log = await BackupRepository.getBackupById(id);
    if (!log || log.status !== 'SUCCESS') {
      throw new Error('Valid target backup archive not found.');
    }

    // Stub restore database trigger (in production, would unpack archive and overwrite tables)
    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'BACKUP',
      entityId: id,
      description: `System restore initiated from archive: ${log.filename}`
    });

    return { success: true, message: 'Restore sequence initiated.' };
  }
}

export default new BackupService();
