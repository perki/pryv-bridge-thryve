const thryve = require('./thryve.js');
const pryv = require('./pryv.js');
const logger = require('../logging.js');
const storage = require('../repositories/Storage.js');
const availableSources = require('../schemaConverter/sources');
const {convertToPryv} = require('../utils');

class Sync {
  constructor(pryvEndpoint, thryveToken) {
    this.pryvEndpoint = pryvEndpoint;
    this.thryveToken = thryveToken;
  }

  async syncAll(startTime, endTime, source){
    await this.syncData(startTime, endTime, source, true);
    await this.syncData(startTime, endTime, source, false);
  }

  /**
   * Synchronize daily and intraday data, updates timestamps
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {number} source
   * @param isDaily
   * @returns {Promise<Array>}
   */
  async syncData(startDate, endDate, source, isDaily) {
    const thryveResponse = await this.fetchFromThryve(startDate, endDate, source, isDaily);
    if (!thryveResponse.body[0].dataSources) {
      throw new Error('Invalid datasource content: ' + thryveResponse.body[0]);
    }
    const filteredData = this.filterResults(thryveResponse.body[0].dataSources, isDaily);
    if (filteredData.length) {
      const data = convertToPryv(filteredData);

      if(Object.keys(data).length) {
        await this.uploadToPryv(data);
        this.updateSyncSources(thryveResponse.body[0].dataSources);

        console.info(`Successfully transferred ${isDaily ? 'daily' : 'intraDays'} data for 
                            user: ${this.pryvEndpoint}, source: ${source === -1 ? 'All sources' : availableSources[source]}`);
      } else {
        console.info('There was data to update, but it wasn`t found in schema');
      }
    }

    return filteredData;
  }

  /**
   * Fetch data from Thryve
   *
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {number} thryveSourceCode Thryve SourceCode negative for all
   * @param {Boolean} isDaily true for daily, false for intraday
   * @returns {Promise<{object}>} resThryve
   */
  async fetchFromThryve(startDate, endDate, thryveSourceCode, isDaily) {
    let resThryve = null;
    try {
      // get data from Thryve
      resThryve = await thryve.getDynamicValues(this.thryveToken, startDate, endDate, isDaily, thryveSourceCode);

    } catch (error) {
      logger.error('ErrorX: ', error);
      throw new Error('Error while connecting to Thryve');
    }

    if (!resThryve.body.length || !resThryve.body[0].dataSources) { // todo add proper handling
      throw new Error('Invalid body response: ' + resThryve.body);
    }

    return resThryve;
  }

  /**
   * Inserts or updates each synced source
   * time = last data record time || sync
   * @param {Array} dataSources
   */
  updateSyncSources(dataSources) {
    const syncedSources = storage.getSyncedSources(this.pryvEndpoint);

    dataSources.forEach(item => {
      const {data, dataSource} = item;
      const sync = syncedSources[dataSource];
      const lastEvent = data[data.length - 1];

      let intraTime = +(new Date(lastEvent.timestamp));
      let dailyTime = +(new Date(lastEvent.day));

      if (sync) {
        intraTime = intraTime || sync.intraTime;
        dailyTime = dailyTime || sync.dailyTime;
        storage.updateSyncSource(this.pryvEndpoint, dailyTime, intraTime);
      } else {
        storage.addSyncSourceForUser(this.pryvEndpoint, dataSource, dailyTime, intraTime);
      }
    });
  }

  /**
   *
   * @param data
   * @returns {Promise<{pryvResult: Array, pryvRequest: *}>}
   */
  async uploadToPryv(data) {
    let pryvResponse = null;
    try {
      pryvResponse = await pryv.postStreamsAndEvents(this.pryvEndpoint, data);
    } catch (error) {
      logger.error('ErrorY: ', error);
      throw new Error('Error while connecting to Pryv');
    }

    return {
      pryvRequest: data,
      pryvResult: pryvResponse
    }
  }

  /**
   * Filters response sources with timestamp before last synced time
   * @param {Array} dataSources
   * @param {Boolean} isDaily
   * @returns {Array}
   */
  filterResults(dataSources, isDaily) {
    const syncedSources = storage.getSyncedSources(this.pryvEndpoint);
    let result = [];

    dataSources.forEach(item => {
      const {data, dataSource} = item;
      const sync = syncedSources[dataSource];
      let resultData = data;

      if (sync) {
        resultData = data.filter(event => {
          if (isDaily) {
            const eventTime = +(new Date(event.day));
            return eventTime > sync.dailyTime;
          }

          const eventTime = +(new Date(event.timestamp));
          return eventTime > sync.intraTime;
        });
      }

      if (resultData.length) {
        result.push({dataSource, data: resultData});
      }
    });

    return result;
  }
}

module.exports = Sync;

