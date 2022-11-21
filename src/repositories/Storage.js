const config = require('../config.js');
const db = require('better-sqlite3')(config.get('database:path'));


class StorageRepository {
  queries = {
    queryInsertUser: db.prepare('INSERT OR REPLACE INTO users (pryvEndpoint, thryveToken) VALUES (@pryvEndpoint, @thryveToken)'),
    queryGetUser: db.prepare('SELECT * FROM users WHERE pryvEndpoint = @pryvEndpoint'),
    queryGetUserForThryveToken: db.prepare('SELECT pryvEndpoint FROM users WHERE thryveToken = @thryveToken'),
    queryGetThryvTokenForUser: db.prepare('SELECT thryveToken FROM users WHERE pryvEndpoint = @pryvEndpoint'),
    queryUpdateSyncSourceForUser: db.prepare(`
        UPDATE sync 
        SET dailyTime = @dailyTime,
        intraTime = @intraTime
        WHERE userpryv = @pryvEndpoint
      `),
    queryInsertSyncSourceForUser: db.prepare(`
        INSERT OR REPLACE INTO sync (userpryv, source, dailyTime, intraTime )
        VALUES (@pryvEndpoint, @source, @dailyTime, @intraTime)
      `),
    queryGetUserSync: db.prepare('SELECT * from sync WHERE userpryv = @pryvEndpoint'),
    //
    queryGetAllUsers: db.prepare('SELECT * FROM users'),
  };

  /**
   *
   * @param pryvEndpoint
   * @returns {Object}
   */
  getSyncedSources = (pryvEndpoint) => {
    return this.queries.queryGetUserSync.all({pryvEndpoint})
      .reduce((obj, item) => {
        obj[item.source] = item;
        return obj;
      }, {});
  };

  /**
   *
   * @param {String} pryvEndpoint
   * @param {String} thryveToken
   */
  addUser = (pryvEndpoint, thryveToken) => {
    this.queries.queryInsertUser.run({pryvEndpoint, thryveToken, lastSync: 0});
  };

  /**
   *
   * @param pryvEndpoint
   */
  getUser = (pryvEndpoint) => {
    return this.queries.queryGetUser.get({pryvEndpoint});
  };

  /**
   * @param {String} thryveToken
   */
  pryvForThryveToken = thryveToken => this.queries.queryGetUserForThryveToken.get({thryveToken});

  /**
   * @param {String} pryvEndpoint
   */
  tokenForPryvEndpoint = pryvEndpoint => this.queries.queryGetThryvTokenForUser.get({pryvEndpoint});

  addSyncSourceForUser = (pryvEndpoint, source, dailyTime = 0, intraTime = 0) => {
    this.queries.queryInsertSyncSourceForUser.run({pryvEndpoint, source, dailyTime, intraTime});
  };

  updateSyncSource(pryvEndpoint, dailyTime = 0, intraTime = 0) {
    this.queries.queryUpdateSyncSourceForUser.run({pryvEndpoint, dailyTime, intraTime});
  }

  getAllToBeSynced = () => this.queries.queryGetAllUsers.all({});
}

module.exports = storage = new StorageRepository();
