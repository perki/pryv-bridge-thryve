const storage = require('../repositories/Storage');
const thryve = require('./thryve');
const Sync = require('./Sync');
const {getLastSync, isUserSynced} = require('../utils');

/**
 * If user was synchronized before then fetch data for each new source with timestamp before min last sync time
 * Then fetch data with minimum stored time/date for all sources which will be then filtered by timestamps
 * @param user
 * @returns {Promise<void>}
 */
exports.update = async (user) => {
  const syncedSources = storage.getSyncedSources(user.pryvEndpoint);
  const sync = new Sync(user.pryvEndpoint, user.thryveToken);
  const now = new Date();
  let startTime = new Date(0);

  if (isUserSynced(syncedSources)) { // redundant for cron
    const lastSyncDay = getLastSync(syncedSources, 'dailyTime') || 0;
    const lastSyncTime = getLastSync(syncedSources, 'intraTime') || 0;
    const userInfo = await thryve.getUserInfo(user.thryveToken);
    const connectedSources = userInfo.body[0] ? userInfo.body[0].connectedSources : [];
    const newSources = connectedSources.filter(x => !syncedSources[x]);

    for (const source of newSources) {
      await sync.syncAll(startTime, now, source);
    }

    await sync.syncData(new Date(lastSyncDay), now, -1, true);
    await sync.syncData(new Date(lastSyncTime), now, -1, false);
  } else {
    await sync.syncAll(startTime, now, -1);
  }
};
