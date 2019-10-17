const config = require('../config.js');
const db = require('better-sqlite3')(config.get('database:path'));

db.prepare('CREATE TABLE IF NOT EXISTS users (pryvEndpoint varchar(200) primary key, thryveToken varchar(100))').run();
db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS thryveToken_index ON users(thryveToken)').run();
db.prepare('CREATE TABLE IF NOT EXISTS sync (syncid integer primary key, userpryv varchar(200), source integer, dailyTime integer, intraTime integer, FOREIGN KEY(userpryv) REFERENCES users(pryvEndpoint))').run();
db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS pryv_source ON sync(userpryv, source)').run();
