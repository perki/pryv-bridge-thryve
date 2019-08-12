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
)**/


/**
 * update all users with a lastSynch older that now - delay in miliseconds
 */
exports.checkForupdate = async function (delay) {
  const ulist = storage.getAllSynchedBefore(delay);

  console.log('zzzzzz', ulist);
  return await Promise.all(ulist.map(async function (user) {

    const streamList = [];
    const streamMap = {};
    const events = [];

    try {

      // get data from Thryve
      const result = await thryve.dynamicValues(user.thryveToken, new Date(user.lastSynch), new Date(), false);

      // convert to pryv model
      if (!result.body[0] || !result.body[0].dataSources) {
        throw new Error('Invalid body response: ' + result.body);
      }

      result.body[0].dataSources.map(function (dataSource) {
        if (!dataSource) {
          throw new Error('Invalid datasource content: ' + result.body[0]);
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
      const resPryv = await pryv.postStreamsAndEvents(user.pryv, { streams: streamList, events: events });

      console.log('YYYYYY', resPryv);
    } catch (error) {
      logger.error('ErrorX: ', error);
    }
  }));

}