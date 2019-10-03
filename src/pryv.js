const request = require('superagent');
const rootStream = require('./config.js').get('pryv:rootstream');

// This should be removed as soon as Pryv API version >= 1.4.16
const regexAPIandToken = /(.+):\/\/(.+)@(.+)/gm;
function extractAPIandToken(pryvEndpoint) {
  regexAPIandToken.lastIndex = 0;
  const res = regexAPIandToken.exec(pryvEndpoint);
  return {api: res[1] + '://' + res[3], token: res[2]}
}

const chunkSize = 1000;
exports.postStreamsAndEvents = async function (pryvEndpoint, streamsAndEvents) {
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
 * Return Last synched
 */
exports.getLastSyncTime = async function (pryvEndpoint) {
  const apiAndToken = extractAPIandToken(pryvEndpoint);
  const lastSyncTime = -100000000000;

  let result = await request.post(apiAndToken.api)
    .set('Authorization', apiAndToken.token)
    .send([{
      method: 'events.get',
      params: {streams: [rootStream.id], limit: 1}
    }]);

  try {
    return result.body.results[0].events[0].time;
  } catch(e){
    return new Date(0);
  }
};
