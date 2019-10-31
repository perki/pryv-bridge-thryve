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

  const {startTimestamp, endTimestamp, dataSource} = trigger;

  if (['DAILY', 'BOTH'].includes(trigger.updateType)) {
    await sync.syncData(true, startTimestamp, endTimestamp, dataSource);

    logger.info('Trigger Daily: ' + new Date(endTimestamp));
  }

  if (['MINUTE', 'BOTH'].includes(trigger.updateType)) {
    await sync.syncData(false, startTimestamp, endTimestamp, dataSource);
    logger.info('Trigger Minutes: ' + new Date(endTimestamp));
  }
};

function validateTriggerRequest(triggerData) {
  if (!triggerData || !triggerData.sourceUpdate) {
    throw Error('Invalid or missing trigger data');
  }
  const trigger = triggerData.sourceUpdate;
  const {updateType, connectionStatus, dataSource, authenticationToken} = trigger;

  if (dataSource.trim().length > 2) { // in case of '11,12'
    throw Error('Invalid dataSource');
  }

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
}
