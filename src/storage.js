const config = require('./config.js');
const db = require('better-sqlite3')(config.get('database:path'), { verbose: console.log });

db.prepare('CREATE TABLE IF NOT EXISTS users (pryv varchar(200) primary key, thryveToken varchar(100), lastSynch REAL)').run();
db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS pryv_index ON users(pryv)').run();
db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS thryveToken_index ON users(thryveToken)').run();
db.prepare('CREATE INDEX IF NOT EXISTS lastSynch_index ON users(lastSynch)').run();

const insert = db.prepare('INSERT OR REPLACE INTO users (pryv, thryveToken, lastSynch) VALUES (@pryv, @thryveToken, @lastSynch)');

exports.addUser = function(pryv, thryveToken) {
  insert.run({ pryv: pryv, thryveToken: thryveToken, lastSynch: 0});
}

