const config = require('./config.js');
const db = require('better-sqlite3')(config.get('database:path'), { verbose: console.log });

db.prepare('CREATE TABLE IF NOT EXISTS users (pryvEndpoint varchar(200) primary key, thryveToken varchar(100))').run();
db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS thryveToken_index ON users(thryveToken)').run();

const queryInsertUser = db.prepare('INSERT OR REPLACE INTO users (pryvEndpoint, thryveToken) VALUES (@pryvEndpoint, @thryveToken)');
const queryGetUserForThryveToken = db.prepare('SELECT pryvEndpoint FROM users WHERE thryveToken = @thryveToken');
const queryGetThryvTokenForUser = db.prepare('SELECT thryveToken FROM users WHERE pryvEndpoint = @pryvEndpoint');


addUser = (pryvEndpoint, thryveToken) => {
  queryInsertUser.run({ pryvEndpoint, thryveToken, lastSync: 0});
};
/**
 * @param {String} thryveToken
 */
pryvForThryveToken = thryveToken => queryGetUserForThryveToken.get({ thryveToken });

/**
 * @param {String} pryvEndpoint
 */
tokenForPryvEndpoint = pryvEndpoint => queryGetThryvTokenForUser.get({ pryvEndpoint });


// ---- Not used Yet ---/

db.prepare('CREATE TABLE IF NOT EXISTS sync (syncid integer primary key, userpryv varchar(200), source integer, time integer, FOREIGN KEY(userpryv) REFERENCES users(pryvEndpoint))').run();
db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS pryv_source ON sync(userpryv, source)').run();
db.prepare('CREATE INDEX IF NOT EXISTS time_index ON sync(time)').run();

const queryInsertSyncSourceForUser = db.prepare('INSERT OR REPLACE INTO sync (userpryv, source) VALUES (@pryvEndpoint, @source)');
const queryGetAllToBeSynched = db.prepare('SELECT users.pryvEndpoint, users.thryveToken, sync.source, sync.time FROM users, sync WHERE users.pryvEndpoint = sync.userpryv');

addSyncSourceForUser = (pryvEndpoint, source) => {
  queryInsertSyncSourceForUser.run({ pryvEndpoint: pryvEndpoint, source: source, time: 0 });
};
getAllToBeSynched = () => queryGetAllToBeSynched.all({});


module.exports = {
  addUser,
  pryvForThryveToken,
  tokenForPryvEndpoint,
  addSyncSourceForUser,
  getAllToBeSynched
};
