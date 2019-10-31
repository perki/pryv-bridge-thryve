const storage = require('../repositories/Storage');
const thryve = require('../services/thryve');
const {update} = require('../services/update');
const logger = require('../logging');
const statuses = require('../statuses');

/**
 * Stores user and synchronizes his data
 * If there was an error on previous sync, trying to update
 * @param {Object} user
 * @returns {string} status
 */
const initUser = user => {
  const userRecord = storage.getUser(user.pryvEndpoint);

  if (!userRecord) {
    logger.info(`Init User: ${user.pryvEndpoint} | ${user.thryveToken} `);

    storage.addUser(user.pryvEndpoint, user.thryveToken, null);
    update(user);
  } else if (userRecord.syncStatus === statuses.ERROR) {
    update(user);
  }

  const savedUser = storage.getUser(user.pryvEndpoint);
  return savedUser.syncStatus;
};

/**
 * Get thryveToken by pryvEndpoint
 * @param {String} pryvEndpoint
 * @returns {Promise<{object}|null>}
 */
getUser = async (pryvEndpoint) => {
  const dbres = storage.tokenForPryvEndpoint(pryvEndpoint);
  if (!dbres) {
    return null;
  }
  return await thryve.getUserInfo(dbres.thryveToken);
};

module.exports = {
  initUser,
  getUser
};

