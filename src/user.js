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
 * update all users with a lastSynch older that now - delay in miliseconds
 */
exports.checkForUpdate = async function (delay) {
  const ulist = storage.getAllSynchedBefore(delay);
  return await Promise.all(ulist.map(async function (user) {
    const res = await thryveToPryv(user.pryv, user.thryveToken, new Date(user.lastSynch), new Date(), true, -1);
  }));
}


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
  if (!dbresult.pryv) {
    throw Error('Cannot find user for Trigger Token: ' + trigger.authenticationToken);
  }
  const pryvEndpoint = dbresult.pryv;

  if (!['DAILY', 'BOTH', 'MINUTE'].includes(trigger.updateType)) {
    throw Error('Unkonw Update Type: ' + trigger.updateType);
  }

  try {

    if (['DAILY', 'BOTH'].includes(trigger.updateType)) {
      const resultDaily = await thryveToPryv(pryvEndpoint, trigger.authenticationToken,
        new Date(trigger.startTimestamp),
        new Date(trigger.endTimestamp),
        true, trigger.dataSource);

      console.log('Trigger Daily: ', JSON.stringify(resultDaily));
    }

    if (['MINUTE', 'BOTH'].includes(trigger.updateType)) {
      const resultMinute = await thryveToPryv(pryvEndpoint, trigger.authenticationToken,
        new Date(trigger.startTimestamp),
        new Date(trigger.endTimestamp),
        false, trigger.dataSource);
      console.log('Trigger Minutes: ', JSON.stringify(resultMinute));
    }
  } catch (error) {

  }
}



/**
 * 
 * @param {URL} pryv 
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
    const resThryve = await thryve.dynamicValues(thryveToken, startDate, endDate, true, source);

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
      thryve: resThryve.body[0], 
      pryv: resPryv.body}
  } catch (error) {
    logger.error('ErrorX: ', error);
  }
}
