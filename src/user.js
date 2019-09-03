const thryve = require('./thryve.js');
const pryv = require('./pryv.js');
const storage = require('./storage.js');
const mapData = require('./map.js');
const logger = require('./logging.js');

/** 
thryve.userInfo('664b0b69c0fb04c6881ba16eaef9c789').then(
  function (res) {
    console.log(res.body);
  },
  function (err) {
    console.log(err);
  }
)*/


/**
 * check all users that need to be updated
 */
async function checkForUpdateAll() {
  const ulist = storage.getAllToBeSynched();
  return await Promise.all(ulist.map(async function (user) {
    const res = await thryveToPryv(user.pryvEndpoint, user.thryveToken, new Date(user.lastSynch), new Date(), true, -1);
  }));
}

exports.checkForUpdateAll = checkForUpdateAll;

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

  if (!['DAILY', 'BOTH', 'MINUTE', 'NEW'].includes(trigger.updateType)) {
    logger.warn('Trigger, unkonw type: ' + trigger.updateType + ' TriggerData: ' + JSON.stringify(triggerData));
    return; 
  }

  if (['NEW'].includes(trigger.updateType)) {
    logger.info('Trigger declares new source [' + trigger.dataSource + '] for: ' + trigger.sourceUpdate );
    return; 
  }

  try {

    if (['DAILY', 'BOTH'].includes(trigger.updateType)) {
      const resultDaily = await thryveToPryv(pryvEndpoint, trigger.authenticationToken,
        new Date(trigger.startTimestamp),
        new Date(trigger.endTimestamp),
        true, trigger.dataSource);

      logger.info('Trigger Daily: ' + JSON.stringify(resultDaily));
    }

    if (['MINUTE', 'BOTH'].includes(trigger.updateType)) {
      const resultMinute = await thryveToPryv(pryvEndpoint, trigger.authenticationToken,
        new Date(trigger.startTimestamp),
        new Date(trigger.endTimestamp),
        false, trigger.dataSource);
      logger.info('Trigger Minutes: ' + JSON.stringify(resultMinute));
    }
  } catch (error) {

  }
}


exports.initUser = async function (user) {
  const lastSyncTime = await pryv.getLastSyncTime(user.pryvEndpoint);
  logger.info('Init User: ' + user.pryvEndpoint + ' with LastSynchTime: ' + new Date(lastSyncTime * 1000));
  const dailyRes = await thryveToPryv(user.pryvEndpoint, user.thryveToken, new Date(lastSyncTime * 1000), new Date(), true, -1);
  logger.info('Init daily: ' + JSON.stringify(dailyRes));
  const intraDay = await thryveToPryv(user.pryvEndpoint, user.thryveToken, new Date(lastSyncTime * 1000), new Date(), false, -1);
  logger.info('Init intra: ' + JSON.stringify(intraDay));
}



/**
 * 
 * @param {URL} pryvEndpoint
 * @param {String} thryveToken 
 * @param {Date} startDate 
 * @param {Date} endDate
 * @param {Boolean} isDaily true for daily, false for intraday
 * @param {Int} source negative for all
 */
async function thryveToPryv(pryvEndpoint, thryveToken, startDate, endDate, isDaily, source) {

  try {

    const streamList = [];
    const streamMap = {};
    const events = [];

    // get data from Thryve
    const resThryve = await thryve.dynamicValues(thryveToken, startDate, endDate, isDaily, source);

    // convert to pryv model
    if (!resThryve.body[0] || !resThryve.body[0].dataSources) {
      throw new Error('Invalid body response: ' + result.body);
    }

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
        const res = mapData.thryveToPryv(dataSource.dataSource, data, false);
        if (!res) return;
        events.push(res.event);
        res.streams.map(function (stream) {
          if (streamMap[stream.id]) return;
          streamList.push(stream);
          streamMap[stream.id] = stream;
        })
      });
    });

    // post to pryv
    const resPryv = await pryv.postStreamsAndEvents(pryvEndpoint, { streams: streamList, events: events });

    return {
      thryveResult: resThryve.body[0], 
      //pryvRequest: { streams: streamList, events: events },
      pryvResult: resPryv}
  } catch (error) {
    logger.error('ErrorX: ', error);
  }
}
