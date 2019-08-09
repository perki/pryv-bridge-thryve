const thryve = require('./thryve.js');
const storage = require('./storage.js');
const mapData = require('./map.js');
const logger = require('./logging.js');

thryve.userInfo('664b0b69c0fb04c6881ba16eaef9c789').then(
  function (res) {
    console.log(res.body);
  },
  function (err) {
    console.log(err);
  }
  )


/**
 * update all users with a lastSynch older that now - delay in miliseconds
 */
exports.checkForupdate = function (delay) {
  return new Promise((resolve, reject) => {
  const ulist = storage.getAllSynchedBefore(delay);
  console.log('zzzzzz', ulist);
  ulist.map(async function (user) { 
    try {
      result = await thryve.dynamicValues(user.thryveToken, new Date(user.lastSynch), new Date(), true);
      if (!result.body[0] || !result.body[0].dataSources) {
        throw new Error('Invalid body response: ' + result.body);
      }

      const streamList = [];
      const streamMap = {};
      const events = [];

      result.body[0].dataSources.map(function (dataSource) {
        if (! dataSource) {
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
          if (! res) return;
          events.push(res.event);
          res.streams.map(function (stream) { 
            if (streamMap[stream.id]) return; 
            streamList.push(stream);
            streamMap[stream.id] = stream;
          })
        });
      });

      resolve({streams: streamList, events: events});

    } catch (error) {
      logger.error('Error', error);
      reject(error);
    }
  });

  });
}