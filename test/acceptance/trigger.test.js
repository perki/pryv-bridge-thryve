/*global describe, it */
const config = require('../../src/config.js'),
  request = require('superagent');


const should = require('should');
require('../../src/server');

const serverBasePath = 'http://' + config.get('server:ip') + ':' + config.get('server:port');

const testuser = config.get('test:users')[0];

describe('trigger', function () {

  it('Trigger ', function (done) {
    request.post(serverBasePath + '/trigger')
      .set('Accept', 'application/json')
      .set('Accept-Charset', 'utf-8')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('Content-Type', 'application/json')
      .send({
        "sourceUpdate": {
          "authenticationToken": testuser.thryveToken,
          "partnerUserID": "test",
          "dataSource": "8",
          "startTimestamp": "2019-08-20T11:22:00Z",
          "endTimestamp": "2019-08-20T11:22:00Z",
          "updateType": "MINUTE"
        }
      })
      .end(function (err, res) {
        should.not.exist(err);
        done();
      });
  });
});
