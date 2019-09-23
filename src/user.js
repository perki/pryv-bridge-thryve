const thryve = require('./thryve.js');
const pryv = require('./pryv.js');
const storage = require('./storage.js');
const schemaConverter = require('./schemaConverter');
const logger = require('./logging.js');


/**
 * handle Triggers from thryve. 
 * 
 * 1. Takes the RAW data sent by Thryve
 * 2. Call Thryve API
 * 3. Transform result into Pryv structure and send it
 */
exports.handleTrigger = async function (triggerData) {
  if (!triggerData || !triggerData.sourceUpdate) {
    throw Error('Invalid or missing trigger data');
  }
  const trigger = triggerData.sourceUpdate;

  const dbresult = storage.pryvForThryveToken(trigger.authenticationToken);
  logger.info('Trigger for: ', dbresult);
  if (!dbresult || !dbresult.pryvEndpoint) {
    throw Error('Cannot find user for Trigger Token: ' + trigger.authenticationToken);
  }
  const pryvEndpoint = dbresult.pryvEndpoint;

  if (!['DAILY', 'BOTH', 'MINUTE', 'NEW', 'DELETED'].includes(trigger.updateType)) {
    logger.warn('Trigger, unkonw type: ' + trigger.updateType + ' TriggerData: ' + JSON.stringify(triggerData));
    return; 
  }

  if (['NEW', 'DELETED'].includes(trigger.updateType)) {
    logger.info('Trigger declares ' + trigger.updateType + ' source [' + trigger.dataSource + '] for: ' + trigger.sourceUpdate );
    return; 
  }

  try {

    if (['DAILY', 'BOTH'].includes(trigger.updateType)) {
      const resultDaily = await fetchFromThryveToPryv(pryvEndpoint, trigger.authenticationToken,
        new Date(trigger.startTimestamp),
        new Date(trigger.endTimestamp),
        true, trigger.dataSource);

      logger.info('Trigger Daily: ' + JSON.stringify(resultDaily));
    }

    if (['MINUTE', 'BOTH'].includes(trigger.updateType)) {
      const resultMinute = await fetchFromThryveToPryv(pryvEndpoint, trigger.authenticationToken,
        new Date(trigger.startTimestamp),
        new Date(trigger.endTimestamp),
        false, trigger.dataSource);
      logger.info('Trigger Minutes: ' + JSON.stringify(resultMinute));
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch all data created on Thryve since last synch with Pryv
 * ! running this could miss some data points that would have been added after 
 * the last synchronization and with a timestamp in the past relatively to the 
 * earliest measure.
 */
exports.initUser = async function (user) {
  const lastSyncTime = await pryv.getLastSyncTime(user.pryvEndpoint);
  const lastSyncDate = new Date(lastSyncTime * 1000);
  const now = new Date();
  logger.info('Init User: ' + user.pryvEndpoint + ' with LastSynchTime: ' + lastSyncDate);
  const dailyRes = await fetchFromThryveToPryv(user.pryvEndpoint, user.thryveToken, lastSyncDate, now, true, -1);
  logger.info('Init daily: ' + JSON.stringify(dailyRes));
  const intraDay = await fetchFromThryveToPryv(user.pryvEndpoint, user.thryveToken, lastSyncDate, now, false, -1);
  logger.info('Init intra: ' + JSON.stringify(intraDay));
}



/**
 * Does as per the name of the function.
 * 
 * Fecth data from Thryve and send it to Thryve
 * 
 * @param {URL} pryvEndpoint
 * @param {String} thryveToken 
 * @param {Date} startDate 
 * @param {Date} endDate
 * @param {Boolean} isDaily true for daily, false for intraday
 * @param {Int} tryveSourceCode Thryve SourceCode negative for all
 */
async function fetchFromThryveToPryv(pryvEndpoint, thryveToken, startDate, endDate, isDaily, tryveSourceCode) {
    const streamList = [];
    const streamMap = {};
    const events = [];

  let resThryve = null;
  try {
    // get data from Thryve
    resThryve = await thryve.dynamicValues(thryveToken, startDate, endDate, isDaily, tryveSourceCode);

  } catch (error) {
    logger.error('ErrorX: ', error);
    throw new Error('Error while connecting to Thryve');
  }

  // convert to pryv model
  if (!resThryve.body[0] || !resThryve.body[0].dataSources) {
    throw new Error('Invalid body response: ' + resThryve.body);
  }

  const context = { combinaisons : {} };
  resThryve.body[0].dataSources.map(function (dataSource) {
    if (!dataSource) {
      throw new Error('Invalid datasource content: ' + resThryve.body[0]);
    }
    if (typeof dataSource.dataSource === undefined) {
      throw new Error('Invalid datasource content: ' + dataSource);
    }
    if (!dataSource.data) {
      throw new Error('Invalid datasource content: ' + dataSource);
    }

    dataSource.data.map(function (data) {
      const res = schemaConverter.thryveToPryv(dataSource.dataSource, data, context);
      if (!res) return;
      events.push(res.event);
      res.streams.map(function (stream) {
        if (streamMap[stream.id]) return;
        streamList.push(stream);
        streamMap[stream.id] = stream;
      })
    });
  });
  
  logger.info('Remaining combinaisons: ' + JSON.stringify(context.combinaisons));

  let resPryv = null;
  try { 
  // post to pryv
    resPryv = await pryv.postStreamsAndEvents(pryvEndpoint, { streams: streamList, events: events });
  } catch (error) {
    logger.error('ErrorY: ', error);
    throw new Error('Error while connecting to Pryv');
  }

  return {
    counters: context.counters,
    eventsCounts: events.length,
    //thryveResult: resThryve.body[0], 
    //pryvRequest: { streams: streamList, events: events },
    //pryvResult: resPryv
  }
 
}



/**
 * check all users that need to be updated
 * Known to be BOGUS  and UNFINISHED
 */
async function checkForUpdateAll() {
  const ulist = storage.getAllToBeSynched();
  return await Promise.all(ulist.map(async function (user) {
    const res = await fetchFromThryveToPryv(user.pryvEndpoint, user.thryveToken, new Date(user.lastSynch), new Date(), true, -1);
  }));
}

exports.checkForUpdateAll = checkForUpdateAll;