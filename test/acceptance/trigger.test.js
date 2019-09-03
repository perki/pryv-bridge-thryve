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
          "startTimestamp": "2019-08-21T21:17:00Z",
          "endTimestamp": "2019-08-21T21:17:00Z",
          "updateType": "MINUTE"
        }
      })
      .end(function (err, res) {
        should.not.exist(err);
        done();
      });
  });


  it('Trigger Apple', function (done) {
    this.timeout(20000);
    request.post(serverBasePath + '/trigger')
      .set('Accept', 'application/json')
      .set('Accept-Charset', 'utf-8')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('Content-Type', 'application/json')
      .send({
        "sourceUpdate": {
          "authenticationToken": testuser.thryveToken,
          "partnerUserID": "test",
          "dataSource": "9",
          "startTimestamp": "2019-08-14T16:43:00Z",
          "endTimestamp": "2019-08-21T21:17:00Z",
          "updateType": "MINUTE"
        }
      })
      .end(function (err, res) {
        should.not.exist(err);
        done();
      });
  });
});
