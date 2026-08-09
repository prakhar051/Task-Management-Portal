import MonitoringRepository from '../repositories/monitoring.repository.js';

class LoggingService {
  async log(level, module, message, userId = null) {
    try {
      console.log(`[${level}] [${module}] ${message}`);
      await MonitoringRepository.createSystemLog({
        level,
        module,
        message,
        userId
      });
    } catch (err) {
      console.error('Failed to write system log to database:', err.message);
    }
  }

  async info(module, message, userId = null) {
    await this.log('INFO', module, message, userId);
  }

  async warn(module, message, userId = null) {
    await this.log('WARN', module, message, userId);
  }

  async error(module, message, stack = null, userId = null) {
    await this.log('ERROR', module, `${message} ${stack || ''}`, userId);
    
    // Also save error in dedicated unresolved error logs registry
    try {
      await MonitoringRepository.createErrorLog({
        message,
        stack,
        module,
        userId,
        resolutionStatus: 'UNRESOLVED'
      });
    } catch (err) {
      console.error('Failed to log error inside ErrorLog repository:', err.message);
    }
  }
}

export default new LoggingService();
