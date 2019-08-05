const request = require('superagent');
const conf = require('./config.js');

const thryveAPI = conf.get('thryveAPI');
const thryveInfo = conf.get('thryve');


function post(url, authenticationToken) {
  return request
  .post(url)
  .auth(thryveInfo.auth.user, thryveInfo.auth.password)
  .set('appID', thryveInfo.appId)
  .type('form')
  .send('authenticationToken=' + authenticationToken);
}

exports.userInfo = function(authenticationToken) {
  return post(thryveAPI.userInfo, authenticationToken);
}

/**
 * @param {Date} start
 * @param {Date} stop
 */
exports.dynamicValues = function(authenticationToken, start, stop) {
  return post(thryveAPI.dynamicValues, authenticationToken)
    .send('startTimestamp=' + start.toISOString().split('.')[0] + 'Z')
    .send('endTimestamp=' + stop.toISOString().split('.')[0] + 'Z');
}