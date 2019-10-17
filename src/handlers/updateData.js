const logger = require('../logging.js');
const storage = require('../repositories/Storage');
const {update} = require('../services/update');

/**
 * check all users that need to be updated
 * Known to be BOGUS  and UNFINISHED
 */
exports.updateSourcesData = async () => {
  const sources = storage.getAllToBeSynced();
  return await Promise.all(sources.map(async user => {
    try {
      return await update(user);
    } catch (e) {
      logger.error(`Cannot update data for ${user}`);
    }
  }));
};
