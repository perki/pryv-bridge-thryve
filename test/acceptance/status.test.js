/*global describe, it */
var config = require('../../src/config.js'),
  request = require('superagent');


var should = require('should');
require('../../src/server');

var serverBasePath = 'http://' + config.get('server:ip') + ':' + config.get('server:port');

describe('hello', function () {

  it('Hello', function (done) {
    request.get(serverBasePath + '/')
      .set('Accept', 'application/json')
      .set('Accept-Charset', 'utf-8')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        should.exist(res);
        res.status.should.equal(200);
        done();
      });
  });
});
