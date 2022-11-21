const schemaConverter = require('./schemaConverter');

/**
 *
 * @param {Object} syncedSources
 * @returns {boolean}
 */
function isUserSynced(syncedSources) {
  return !!Object.keys(syncedSources).length;
}

/**
 * Get min time so that we get less results for each source
 * @param {Object} syncedSources
 * @param {String} key
 * @returns {number}
 */
function getLastSync(syncedSources, key) {
  const values = Object.values(syncedSources).map(item => item[key]);
  return Math.min(...values) || 0;
}

function convertToPryv(dataSources) {
  const context = {combinations: {}};
  const streamMap = {};
  let events = [];

  dataSources.map(function (dataSource) {
    if (!dataSource) {
      throw new Error('Invalid datasource content: ' + dataSource);
    }
    if (typeof dataSource.dataSource === undefined || !dataSource.data) {
      throw new Error('Invalid datasource content: ' + dataSource);
    }

    dataSource.data.map(function (data) {
      const res = schemaConverter.thryveToPryv(dataSource.dataSource, data, context);
      if (!res) return;
      events.push(res.event);
      res.streams.map(function (stream) {
        if (!streamMap[stream.id]) streamMap[stream.id] = stream;
      })
    });
  });

  // console.log('Remaining combinations: ' + JSON.stringify(context.combinations));

  return {streams: Object.values(streamMap), events};
}

module.exports = {
  isUserSynced,
  getLastSync,
  convertToPryv
};
