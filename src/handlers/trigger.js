const logger = require('../logging.js');
const storage = require('../repositories/Storage.js');
const Sync = require('../services/Sync');

/**
 * handle Triggers from thryve.
 *
 * 1. Takes the RAW data sent by Thryve
 * 2. Call Thryve API
 * 3. Transform result into Pryv structure and send it
 */
exports.handleTrigger = async function (triggerData) {
  const dbresult = storage.pryvForThryveToken(triggerData.sourceUpdate.authenticationToken);

  if (!dbresult || !dbresult.pryvEndpoint) {
    logger.error('Trigger: No user found');
    throw new Error({code: 404, msg: 'Trigger: No user found'});
  }

  const {pryvEndpoint} = dbresult;
  validateTriggerRequest(triggerData);

  const trigger = triggerData.sourceUpdate;

  const sync = new Sync(pryvEndpoint, trigger.authenticationToken);
  const startDate = new Date(trigger.startTimestamp);
  const endDate = new Date(trigger.endTimestamp);
  const thryveSourceCode = trigger.dataSource;

  if (['DAILY', 'BOTH'].includes(trigger.updateType)) {
    const resultDaily = await sync.syncData(startDate, endDate, thryveSourceCode, true);

    logger.info('Trigger Daily: ' + endDate);
  }

  if (['MINUTE', 'BOTH'].includes(trigger.updateType)) {
    const resultMinute = await sync.syncData(startDate, endDate, thryveSourceCode, false);
    logger.info('Trigger Minutes: ' + endDate);
  }
};

function validateTriggerRequest(triggerData) {
  if (!triggerData || !triggerData.sourceUpdate) {
    throw Error('Invalid or missing trigger data');
  }
  const trigger = triggerData.sourceUpdate;
  const {updateType, connectionStatus, dataSource, authenticationToken} = trigger;

  if (['NEW', 'DELETED'].includes(connectionStatus)) {
    logger.info(`Trigger, unknown type: ${updateType} TriggerData [${JSON.stringify(triggerData)}]`);
    return;
  }

  if (['DAILY', 'MINUTE', 'BOTH'].includes(updateType)) {
    logger.info(`Trigger declares ${updateType} source [${dataSource}]`);
    return;
  }

  const dbresult = storage.pryvForThryveToken(authenticationToken);
  logger.info('Trigger for: ', dbresult);
  if (!dbresult || !dbresult.pryvEndpoint) {
    throw Error('Cannot find user for Trigger Token: ' + authenticationToken);
  }

  return true;
}
