const config = require('../config.js');
const db = require('better-sqlite3')(config.get('database:path'));

db.prepare('CREATE TABLE IF NOT EXISTS users (pryvEndpoint varchar(200) primary key, thryveToken varchar(100), syncStatus varchar(20))').run();
db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS thryveToken_index ON users(thryveToken)').run();
