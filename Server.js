// In your main server file (server.js or app.js)
// import dotenv from "dotenv";
import { connectDB } from './config/db.js';
import { connectReportsDB } from './services/common/reportGenerator.service.js';
import logger, { setLogContext } from './config/logger.js';
import { loadConfig } from './config/config.js';
import { warmUpCache } from './services/socDocs/Doccache.service.js';
// import { startAnomalyCheckCron } from "./services/checkAnomaliesCron.js";
import { startLogAnalyticsCron } from './services/logFieldAnalytics/logAnalyticsCron.service.js';

import { bootstrapPollers } from './services/deviceMonitoring/notificationRule.service.js';
import { startBudgetCheckCron } from './services/costManagement/budget.service.js';
// import { startAnomalyCheckCron } from "./services/checkAnomaliesCron.js";
// import { startBudgetCheckCron } from "./services/checkBudgetsCron.js";
// dotenv.config();

// Conditionally load dotenv ONLY in non-production environments.
// This avoids needing dotenv in production (after npm prune --production).
// src/server.js (ESM)
if (process.env.NODE_ENV !== 'production') {
  try {
    // Dynamic import so it’s only required in non-prod
    const dotenv = await import('dotenv');
    dotenv.config();
    console.log('Loaded .env for local/dev');
  } catch (e) {
    console.warn('dotenv not installed; skipping .env');
  }
}

const PORT = process.env.PORT || 5000;

// Set a startup logging context so early logs are traceable
setLogContext({
  service: 'Startup',
  name: 'System',
  // requestId: 'startup',
});

(async () => {
  try {
    // Load config FIRST
    logger.logEvent({
      type: 'info',
      event: 'CONFIG_LOAD',
      message: 'Loading server configuration...',
    });
    await loadConfig();

    // Import app AFTER config is loaded
    const { default: app } = await import('./app.js');

    // Connect to the main database
    logger.logEvent({
      type: 'info',
      event: 'DB_CONNECT',
      message: '🔌 Connecting to main database...',
    });
    await connectDB();

    logger.logEvent({
      type: 'info',
      event: 'NOTIFICATION_POLLERS_BOOTSTRAP',
      message: '🔔 Bootstrapping device notification pollers...',
    });
    await bootstrapPollers();

    logger.info(' Loading documentation cache...');
    warmUpCache();

    logger.info('🔄 Initializing domain cache...');
    const { DomainCache } = await import('./services/socGenie/domain/cache/domain.cache.js');
    await DomainCache.getInstance().initialize();

    // Then connect to the reports database
    logger.logEvent({
      type: 'info',
      event: 'REPORT_DB_CONNECT',
      message: '🔌 Connecting to reports database...',
    });
    await connectReportsDB();

    // Start the server only after both connections are established
    app.listen(PORT, () => {
      logger.logEvent({
        type: 'info',
        event: 'SERVER_START',
        message: `🚀 Server running on port ${PORT}`,
        data: { port: PORT },
      });
    });

    // Log Analytics Cron (every 30 mins)
    logger.logEvent({
      type: 'info',
      event: 'LOG_ANALYTICS_CRON_START',
      message: '🕒 Scheduling Log Analytics Cron Job (Every 30 mins)...',
    });
    startLogAnalyticsCron();
    // Schedule the monthly report generation
    const { scheduleMonthlyReport } = await import('./services/common/reportGenerator.service.js');
    logger.logEvent({
      type: 'info',
      event: 'MONTHLY_REPORT_CRON_START',
      message: '📅 Monthly report generator scheduled',
    });
    scheduleMonthlyReport();

    //Not Needed as the Data wont be updated frequently it might me once a year
    // Start workspace & table sync cron job
    // logger.info('🕒 Starting Workspace & Table Sync Cron Job...');
    // const { startWorkspaceTableSyncCron } = await import('./services/socGenie/costGenie/metaData/syncWorkspaceTableCron.js');
    // startWorkspaceTableSyncCron();

    logger.info('🕒 Starting Budget Cron Job...');
    startBudgetCheckCron();

    //     // Schedule the daily anomaly check
    // logger.info("🕒 Starting Anomaly Check Cron Job...");
    // startAnomalyCheckCron(); // <--- ADD THIS CALL
  } catch (err) {
    logger.logEvent({
      type: 'error',
      event: 'STARTUP_FAILED',
      message: '❌ Server failed to start',
      data: { error: err?.message, stack: err?.stack },
    });
    process.exit(1);
  }
})();
