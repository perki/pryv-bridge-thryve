const cron = require('node-cron');
const logger = require('../utils/logger');
const MigrationService = require('./migrationService');
const config = require('../config');

const getTrhyveData = cron.schedule(config.get("cron:run"), async () => {
    logger.info("Run getTryveData cron job");
    const migrationService = new MigrationService();
    await migrationService.run();
});

module.exports = {
    getTrhyveData
};
