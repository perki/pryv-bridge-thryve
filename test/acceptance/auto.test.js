/*global describe, it */
const config = require('../../src/config.js'),
  request = require('superagent');


const should = require('should');
require('../../src/server');

const serverBasePath = 'http://' + config.get('server:ip') + ':' + config.get('server:port');

const testuser = config.get('test:users')[0];

describe('Auto', function () {

  it('Create ', function (done) {
    request.post(serverBasePath + '/auto')
      .set('Accept', 'application/json')
      .set('Accept-Charset', 'utf-8')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('Content-Type', 'application/json')
      .send({
          "pryvEndpoint": testuser.pryvEndpoint,
          "source": 5
      })
      .end(function (err, res) {
        should.not.exist(err);
        done();
      });
  });
});
