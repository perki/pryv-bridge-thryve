const config = require('../../config');
const db = require('better-sqlite3')(config.get('db:path'), { verbose: console.log });

class Storage {
    constructor() {
        this.db = db;
    }
}

module.exports = Storage;
