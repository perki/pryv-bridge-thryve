// Dependencies

var logger = require('./logging');
var fs = require('fs');
var nconf = require('nconf');

// Exports

module.exports = nconf;


//Setup nconf to use (in-order): 
//1. Command-line arguments
//2. Environment variables

nconf.argv()
  .env();

// default config file
var  configFile = './config.json';

/// /3. A file located at ..
if (typeof(nconf.get('config')) !== 'undefined') {
  configFile = nconf.get('config');
}


if (fs.existsSync(configFile)) {
  configFile = fs.realpathSync(configFile);
  logger.info('using custom config file: ' + configFile);
} else {
  if (configFile) {
    logger.error('Cannot find custom config file: ' + configFile);
  }
}

if (configFile) {
  nconf.file({ file: configFile});
}

// Set default values
nconf.defaults({
  server: {
    port : 2606,
    ip: '127.0.0.1'
  },
  database: {
    path: './db.sqlite'
  },
  thryveAPI: {
    userInfo: 'https://service.und-gesund.de/restjson/userInformation',
    dynamicValues: 'https://service.und-gesund.de/restjson/v2/dynamicValues',
    dailyDynamicValues: 'https://service.und-gesund.de/restjson/v2/dailyDynamicValues'
  },
  pryv: {
    rootstream: { id: 'thryve', name: 'Thryve' }
  } 
});

if (process.env.NODE_ENV === 'test') {
  // add test config here
}
