const request = require('superagent');
const rootStream = require('./config.js').get('pryv:rootstream');

const regexAPIandToken = /(.*):\/\/(.*)@(.*)/gm;
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
    //console.log(batch.length);
  }
  return res;
}

/**
 * Return Last synched 
 */
exports.getLastSyncTime = async function (pryvEndpoint) {
  const apiAndToken = extractAPIandToken(pryvEndpoint);
  const lastSyncTime = -100000000000;
 
  const result = await request.post(apiAndToken.api)
    .set('Authorization', apiAndToken.token)
    .send([{
      method: 'events.get',
      params: {streams: [rootStream.id], limit: 1}
    }]);

  if (result && result.body && result.body.results && result.body.results[0] && result.body.results[0].events && result.body.results[0].events[0]) { 
    return result.body.results[0].events[0].time;
  }

  return lastSyncTime;
}