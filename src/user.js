const thryve = require('./thryve.js');
const storage = require('./storage.js');
const mapData = require('./map.js');

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
  const ulist = storage.getAllSynchedBefore(delay);
  console.log('zzzzzz', ulist);
  ulist.map(async function (user) { 
    try {
      result = await thryve.dynamicValues(user.thryveToken, new Date(user.lastSynch), new Date());
      if (!result.body[0] || !result.body[0].dataSources) {
        throw new Error('Invalid body response: ' + result.body);
      }

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

        console.log('Result', dataSource.dataSource, dataSource.data.length);

        let last = null;
        dataSource.data.map(function (data) { 
          last = mapData.thryveToPryv(dataSource.dataSource, data, false);
        });
        console.log(last);
      });

      

    } catch (error) {
      logger.error('Error', error);
    }

  });
}