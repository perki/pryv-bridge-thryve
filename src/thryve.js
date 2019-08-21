const request = require('superagent');
const conf = require('./config.js');

const thryveAPI = conf.get('thryveAPI');
const thryveInfo = conf.get('thryve');

/**
 * Post to Thryve API
 * 
 * @param {URL} url 
 * @param {String} authenticationToken 
 */
function post(url, authenticationToken) {
  return request
  .post(url)
  .auth(thryveInfo.auth.user, thryveInfo.auth.password)
  .set('appID', thryveInfo.appId)
  .type('form')
  .send('authenticationToken=' + authenticationToken);
}

/**
 * Retrive userInfo
 */
exports.userInfo = function(authenticationToken) {
  return post(thryveAPI.userInfo, authenticationToken);
}

/**
 * @param {Date} start
 * @param {Date} stop
 * @param {Boolean} daily if true get Daily values, false to receive intraday
 */
exports.dynamicValues = function(authenticationToken, start, stop, daily, source) {
  const sourceStr = (source >= 0) ? ('&dataSource=' + source) : '';
  const url = daily ? thryveAPI.dailyDynamicValues : thryveAPI.dynamicValues;
  const params = 'startTimestamp=' + start.toISOString().split('.')[0] + 'Z&' +
  'endTimestamp=' + stop.toISOString().split('.')[0] + 'Z' + sourceStr;
  console.log(url, params);
  return post(url, authenticationToken)
    .send(params);
}
