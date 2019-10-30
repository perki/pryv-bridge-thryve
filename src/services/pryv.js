const request = require('superagent');
const rootStream = require('../config.js').get('pryv:rootstream');

// This should be removed as soon as Pryv API version >= 1.4.16
const regexAPIandToken = /(.+):\/\/(.+)@(.+)/gm;
function extractAPIandToken(pryvEndpoint) {
  regexAPIandToken.lastIndex = 0;
  const res = regexAPIandToken.exec(pryvEndpoint);
  return {api: res[1] + '://' + res[3], token: res[2]}
}

const chunkSize = 1000;
postStreamsAndEvents = async function (pryvEndpoint, streamsAndEvents) {
  const batch = [];
  streamsAndEvents.streams.map(function (stream) {
    batch.push({
      method: 'streams.create',
      params: stream
    })
  });

  streamsAndEvents.events.map(function (event) {
    batch.push({
      method: 'events.create',
      params: event
    })
  });
  // do send
  const apiAndToken = extractAPIandToken(pryvEndpoint);
  const res = [];
  while (batch.length > 0) {
    const thisBatch = batch.splice(0, chunkSize);
    const resRequest = await request.post(apiAndToken.api)
      .set('Authorization', apiAndToken.token)
      .send(thisBatch);
    res.push(resRequest.body);
  }
  return res;
};

/**
 *
 * @param pryvEndpoint
 * @param parentId
 * @returns {Promise<*>}
 */
getUserStreams = async (pryvEndpoint, parentId = rootStream.id) => {
  const apiAndToken = extractAPIandToken(pryvEndpoint);

  const resRequest = await request.post(apiAndToken.api)
    .set('Authorization', apiAndToken.token)
    .send([{
      method: 'streams.get',
      params: {parentId}
    }]);

  return resRequest.body.results ? resRequest.body.results[0].streams : [];
};

/**
 * Return Last synced
 * @param pryvEndpoint
 * @param streams
 * @returns {Promise<number>}
 */
async function getStreamLastSyncTime(pryvEndpoint, streams) {
  const apiAndToken = extractAPIandToken(pryvEndpoint);
  const lastSyncTime = 0;
  const streamsParam = streams || [rootStream.id];

  let result = await request.post(apiAndToken.api)
    .set('Authorization', apiAndToken.token)
    .send([{
      method: 'events.get',
      params: {streams: streamsParam, limit: 1}
    }]);

  try {
    return result.body.results[0].events[0].time;
  } catch (e) {
    return lastSyncTime;
  }
}

module.exports = {
  getStreamLastSyncTime,
  postStreamsAndEvents,
  getUserStreams
};
