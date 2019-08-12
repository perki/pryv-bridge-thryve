const request = require('superagent');


const regexAPIandToken = /(.*):\/\/(.*)@(.*)/gm;
function extractAPIandToken(url) {
  const res = regexAPIandToken.exec(url);

  return {api: res[1] + '://' + res[3], token: res[2]}
}

exports.postStreamsAndEvents = function (pryv, streamsAndEvents) {
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
  const apiAndToken = extractAPIandToken(pryv);
  return request.post(apiAndToken.api)
  .set('Authorization', apiAndToken.token)
  .send(batch);
}