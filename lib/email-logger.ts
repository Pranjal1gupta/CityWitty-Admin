// Email logging utility for monitoring and debugging
export interface EmailLog {
  email: string;
  type: 'otp' | 'password_reset' | 'other';
  status: 'sent' | 'failed' | 'pending';
  error?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class EmailLogger {
  private logs: EmailLog[] = [];
  private readonly maxLogs = 1000; // Keep last 1000 logs in memory

  log(logEntry: Omit<EmailLog, 'timestamp'>) {
    const entry: EmailLog = {
      ...logEntry,
      timestamp: new Date(),
    };

    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EMAIL ${entry.status.toUpperCase()}] ${entry.type} to ${entry.email}`, entry.error ? { error: entry.error } : '');
    }

    // In production, you might want to send to a logging service
    // this.sendToLoggingService(entry);
  }

  getLogs(email?: string, type?: EmailLog['type'], limit = 50) {
    let filteredLogs = this.logs;

    if (email) {
      filteredLogs = filteredLogs.filter(log => log.email === email);
    }

    if (type) {
      filteredLogs = filteredLogs.filter(log => log.type === type);
    }

    return filteredLogs.slice(-limit).reverse(); // Most recent first
  }

  getStats() {
    const total = this.logs.length;
    const sent = this.logs.filter(log => log.status === 'sent').length;
    const failed = this.logs.filter(log => log.status === 'failed').length;
    const successRate = total > 0 ? (sent / total) * 100 : 0;

    return {
      total,
      sent,
      failed,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  // Method to send logs to external logging service in production
  // private async sendToLoggingService(log: EmailLog) {
  //   // Implement integration with services like LogRocket, Sentry, etc.
  // }
}

export const emailLogger = new EmailLogger();