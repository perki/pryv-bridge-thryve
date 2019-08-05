const config = require('./config.js');
const db = require('better-sqlite3')(config.get('database:path'), { verbose: console.log });

db.prepare('CREATE TABLE IF NOT EXISTS users (pryv varchar(100) primary key, pryvToken varchar(100), thryveToken varchar(100), lastSynch REAL)').run();
db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS pryv_index ON users(pryv)').run();
db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS thryveToken_index ON users(thryveToken)').run();
db.prepare('CREATE INDEX IF NOT EXISTS lastSynch_index ON users(lastSynch)').run();



