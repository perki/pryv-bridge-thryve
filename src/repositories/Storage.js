const config = require('../config.js');
const db = require('better-sqlite3')(config.get('database:path'));

class StorageRepository {
  queries = {
    insertUser: db.prepare('INSERT OR REPLACE INTO users (pryvEndpoint, thryveToken, syncStatus) VALUES (@pryvEndpoint, @thryveToken, @syncStatus)'),
    getUser: db.prepare('SELECT * FROM users WHERE pryvEndpoint = @pryvEndpoint'),
    getUserForThryveToken: db.prepare('SELECT pryvEndpoint FROM users WHERE thryveToken = @thryveToken'),
    getThryvTokenForUser: db.prepare('SELECT thryveToken FROM users WHERE pryvEndpoint = @pryvEndpoint'),
    getAllUsers: db.prepare('SELECT * FROM users'),
    updateSyncStatus: db.prepare(`
      UPDATE users
        SET syncStatus = @syncStatus
      WHERE
      pryvEndpoint = @pryvEndpoint
    `)
  };

  /**
   *
   * @param {String} pryvEndpoint
   * @param {String} thryveToken
   * @param {String} syncStatus
   */
  addUser = (pryvEndpoint, thryveToken, syncStatus) => {
    this.queries.insertUser.run({pryvEndpoint, thryveToken, syncStatus});
  };

  getUser = pryvEndpoint => this.queries.getUser.get({pryvEndpoint});

  getUsers = () => this.queries.getAllUsers.all({});

  updateUserSyncStatus = (pryvEndpoint, syncStatus) => this.queries.updateSyncStatus.run({pryvEndpoint, syncStatus});

  /**
   * @param {String} thryveToken
   */
  pryvForThryveToken = thryveToken => this.queries.getUserForThryveToken.get({thryveToken});

  /**
   * @param {String} pryvEndpoint
   */
  tokenForPryvEndpoint = pryvEndpoint => this.queries.getThryvTokenForUser.get({pryvEndpoint});
}

module.exports = storage = new StorageRepository();
