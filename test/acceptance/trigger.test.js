/*global describe, it */
var config = require('../../src/config.js'),
  request = require('superagent');


var should = require('should');
require('../../src/server');

var serverBasePath = 'http://' + config.get('server:ip') + ':' + config.get('server:port');

describe('trigger', function () {

  it('Test', function (done) {
    request.post(serverBasePath + '/trigger')
      .set('Accept', 'application/json')
      .set('Accept-Charset', 'utf-8')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('Content-Type', 'application/json')
      .send({
        "sourceUpdate": {
          "authenticationToken": "test",
          "partnerUserID": "test",
          "dataSource": "1",
          "startTimestamp": "2018-01-01T00:00:00Z",
          "endTimestamp": "2018-01-02T00:00:00Z",
          "updateType": "DAILY"
        }
      })
      .end(function (err, res) {
        should.exist(err);
        done();
      });
  });
});
