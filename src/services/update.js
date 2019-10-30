const storage = require('../repositories/Storage');
const Sync = require('./Sync');
const statuses = require('../statuses');

/**
 * @param user
 * @returns {Promise<void>}
 */
exports.update = async (user) => {
  const sync = new Sync(user.pryvEndpoint, user.thryveToken);

  storage.updateUserSyncStatus(user.pryvEndpoint, statuses.STARTED);
  try {
    await sync.syncAll();

    storage.updateUserSyncStatus(user.pryvEndpoint, statuses.DONE);
  } catch (e) {
    storage.updateUserSyncStatus(user.pryvEndpoint, statuses.ERROR);
  }
};
