/*global describe, it */
var config = require('../../src/config.js'),
  request = require('superagent');


var should = require('should');
require('../../src/server');

var serverBasePath = 'http://' + config.get('server:ip') + ':' + config.get('server:port');

describe('user', function () {

  it('Create', function (done) {
    request.post(serverBasePath + '/user')
      .set('Accept', 'application/json')
      .set('Accept-Charset', 'utf-8')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('Content-Type', 'application/json')
      .send({
        pryv: 'https://cjyyo1s1k004g0ed3fmdo22e9@pythryve.pryv.me',
        thryveToken: 'abcd'
      })
      .end(function (err, res) {
        should.exist(res);
        should.exist(res.body.result);
        should.equal(res.body.result,'OK');
        res.status.should.equal(200);
        done();
      });
  });
});
