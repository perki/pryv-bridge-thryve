const request = require('superagent');
const config = require('../config');


const thryveAPI = config.get('thryveAPI');
const thryveInfo = config.get('thryve');


function post(url, body) {
    const appAuth = `Basic ${Buffer.from( thryveInfo.appId + ":"+thryveInfo.appSecret).toString('base64')}`;
    const response = request
        .post(url)
        .auth(thryveInfo.auth.user, thryveInfo.auth.password)
        .set('appID', thryveInfo.appId)
        .set('AppAuthorization', appAuth)
        .type('form')
        .send(body);
    return response;
}

class ThryveService {

    userInfo(authenticationToken) {
        return post(thryveAPI.userInfo, {authenticationToken});
    }

    getDynamicValues (authenticationToken, start, stop, createdAt = null, daily = false, thryveSourceCode = -1) {
        const url = daily ? thryveAPI.dailyDynamicValues : thryveAPI.dynamicValues;

        const body = {
            authenticationToken: authenticationToken,
            //startTimestamp: start.toISOString().split('.')[0]+'Z',
            //endTimestamp: stop.toISOString().split('.')[0] + 'Z'
        };


        if(createdAt) body.createdAt = createdAt;
        if(thryveSourceCode > 0) body.dataSource = thryveSourceCode;

        return post(url, body);
    };
}

module.exports = ThryveService;
