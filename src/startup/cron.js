const cron = require('node-cron');
const logger = require('../logging');
const {updateSourcesData} = require("../handlers/updateData");

cron.schedule("0 * * * * *", async function () {
  await updateSourcesData();
  logger.info('Cron update ', (new Date).toISOString());
});

