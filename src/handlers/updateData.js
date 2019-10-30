const logger = require('../logging.js');
const storage = require('../repositories/Storage');
const {update} = require('../services/update');

/**
 * Update all users stored in db
 */
exports.updateSourcesData = async () => {
  const users = storage.getUsers();
  return await Promise.all(users.map(async user => {
    try {
      return await update(user);
    } catch (e) {
      logger.error(`Cannot update data for ${user}`);
    }
  }));
};
