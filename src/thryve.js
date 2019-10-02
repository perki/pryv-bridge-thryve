const request = require('superagent');
const conf = require('./config.js');

const thryveAPI = conf.get('thryveAPI');
const thryveInfo = conf.get('thryve');

/**
 * Post to Thryve API
 *
 * @param {URL} url
 * @param {Object} body
 */
function post(url, body) {
  const appAuth = `Basic ${Buffer.from( thryveInfo.appId + ":"+thryveInfo.appSecret).toString('base64')}`;
  return request
    .post(url)
    .auth(thryveInfo.auth.user, thryveInfo.auth.password)
    .set('appID', thryveInfo.appId)
    .set('AppAuthorization', appAuth)
    .type('form')
    .send(body);
}

/**
 * Retrive userInfo
 */
exports.userInfo = function(authenticationToken) {
  return post(thryveAPI.userInfo, authenticationToken);
};

/**
 * @param {String} authenticationToken
 * @param {Date} start
 * @param {Date} stop
 * @param {Boolean} daily if true get Daily values, false to receive intraday
 * @param {String} thryveSourceCode
 */
exports.dynamicValues = function(authenticationToken, start, stop, daily, thryveSourceCode) {
  const url = daily ? thryveAPI.dailyDynamicValues : thryveAPI.dynamicValues;

  const body = {
    authenticationToken: authenticationToken,
    startTimestamp: start.toISOString().split('.')[0]+'Z',
    endTimestamp: stop.toISOString().split('.')[0] + 'Z'
  };

  if(thryveSourceCode) body.dataSource = thryveSourceCode;

  return post(url, body);
};
