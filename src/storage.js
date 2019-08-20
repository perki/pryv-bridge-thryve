const config = require('./config.js');
const db = require('better-sqlite3')(config.get('database:path'), { verbose: console.log });

db.prepare('CREATE TABLE IF NOT EXISTS users (pryv varchar(200) primary key, thryveToken varchar(100), lastSynch INTEGER)').run();
db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS pryv_index ON users(pryv)').run();
db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS thryveToken_index ON users(thryveToken)').run();
db.prepare('CREATE INDEX IF NOT EXISTS lastSynch_index ON users(lastSynch)').run();

const queryInsert = db.prepare('INSERT OR REPLACE INTO users (pryv, thryveToken, lastSynch) VALUES (@pryv, @thryveToken, @lastSynch)');

const queryGetFromLastSynch = db.prepare('SELECT pryv, thryveToken, lastSynch FROM users WHERE lastSynch < @since');

const queryGetUserForThryveToken = db.prepare('SELECT pryv FROM users WHERE thryveToken = @thryveToken');

exports.addUser = function(pryv, thryveToken) {
  queryInsert.run({ pryv: pryv, thryveToken: thryveToken, lastSynch: 0});
}


/**
 * @param {Milliseconds} delay
 */
exports.getAllSynchedBefore = function (delay) {
  const since = Date.now() - delay;
  return queryGetFromLastSynch.all({ since: since });
}

/**
 * @param {String} thryveToken
 */
exports.pryvForThryveToken = function (thryveToken) {
  return queryGetUserForThryveToken.get({ thryveToken: thryveToken });
}
