const storage = require('../repositories/Storage');
const thryve = require('../services/thryve');
const {update} = require('../services/update');
const logger = require('../logging');

/**
 * Stores user and synchronizes his data
 * @param user
 * @returns {Promise<void>}
 */
const initUser = async (user) => {
  const userRecord = storage.getUser(user.pryvEndpoint);

  if (!userRecord) {
    logger.info('Init User: ' + user.pryvEndpoint);

    storage.addUser(user.pryvEndpoint, user.thryveToken);
  }

  await update(user);
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

