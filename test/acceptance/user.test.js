/*global describe, it */
const config = require('../../src/config.js'),
  request = require('superagent');


const should = require('should');
require('../../src/server');

const serverBasePath = 'http://' + config.get('server:ip') + ':' + config.get('server:port');
const testuser = config.get('test:users')[1];

describe('User', function () {

  it('Create', function (done) {
    request.post(serverBasePath + '/user')
      .set('Accept', 'application/json')
      .set('Accept-Charset', 'utf-8')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('Content-Type', 'application/json')
      .send({
        pryvEndpoint: testuser.pryvEndpoint,
        thryveToken: testuser.thryveToken
      })
      .end(function (err, res) {
        should.exist(res);
        should.exist(res.body.result);
        should.equal(res.body.result,'OK');
        res.status.should.equal(200);
        done();
      });
  });


  it('Thryve Infos', function (done) {
    request.get(serverBasePath + '/user/thryve')
      .set('Accept', 'application/json')
      .set('Accept-Charset', 'utf-8')
      .set('Accept-Encoding', 'gzip, deflate')
      .query({
        pryvEndpoint: testuser.pryvEndpoint
      })
      .end(function (err, res) {
        should.exist(res);
        should.exist(res.body.result);
        should.exist(res.body.result.partnerUserID);
        res.status.should.equal(200);
        done();
      });
  });
});
