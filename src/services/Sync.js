const thryve = require('./thryve.js');
const pryv = require('./pryv.js');
const logger = require('../logging.js');
const availableSources = require('../schemaConverter/sources');
const {getLeaves, convertToPryv} = require('../utils');

class Sync {
  constructor(pryvEndpoint, thryveToken) {
    this.pryvEndpoint = pryvEndpoint;
    this.thryveToken = thryveToken;
  }

  async syncAll() {
    await this.syncData(true);
    await this.syncData(false);
  }

  /**
   * Synchronize daily and intraday data
   * @param {boolean} isDaily
   * @param {number} startTime
   * @param {number} endTime
   * @param {number} source
   */
  async syncData(isDaily = false, startTime = 0, endTime, source) {
    const parentId = isDaily ? 'thryve-daily' : 'thryve-intraday';
    let streams = await this.getUserStreams(parentId);
    let sourcesLastSync;

    if (streams.length) {
      if (source) streams = streams.filter(stream => ~stream.indexOf(source));

      sourcesLastSync = await this.getSourcesLastSyncTime(streams);
      const minTime = Math.min(...Object.values(sourcesLastSync));
      if (!startTime) startTime = minTime * 1000;
    }

    const startDate = new Date(startTime);
    const endDate = endTime ? new Date(endTime) : new Date();

    const data = await this.getDataToUpload(startDate, endDate, source, isDaily, sourcesLastSync);

    if (data.events.length) {
      await this.uploadToPryv(data);
      logger.info(
        `Successfully transferred ${isDaily ? 'daily' : 'intraDays'} data for user: ${this.pryvEndpoint}, source: ${source === -1 ? 'All' : availableSources[source]}`);
    }
  }

  async getDataToUpload(startDate, endDate, source, isDaily, sourcesLastSync) {
    const thryveResponse = await this.fetchFromThryve(startDate, endDate, source, isDaily);
    const filteredData = this.filterData(thryveResponse.body[0].dataSources, sourcesLastSync);
    return convertToPryv(filteredData);
  }

  /**
   * Filter events those timestamps are before the correspondent stream
   */
  filterData(dataSources, sourcesLastSync) {
    const filteredData = [];
    dataSources.forEach(source => {
      const {dataSource} = source;
      const data = source.data.filter(event => {
        const time = (new Date(event.day ? event.day : event.timestamp)) / 1000;
        return !(sourcesLastSync[dataSource] && time <= sourcesLastSync[dataSource]);
      });

      if (data.length) {
        filteredData.push({dataSource, data});
      }
    });

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
   *
   * @param {string} parentId
   * @returns {Promise<string[]>}
   */
  async getUserStreams(parentId) {
    const streams = await pryv.getUserStreams(this.pryvEndpoint, parentId) || [];
    let sourceStreams = [];
    streams.forEach(stream => getLeaves(sourceStreams, stream));
    return sourceStreams;
  }

  /**
   *
   * @param {string[]} streams
   * @returns {Promise<void>}
   */
  async getSourcesLastSyncTime(streams) {
    const streamsTimestamp = {};

    try {
      await Promise.all(streams.map(async stream => {
          const match = /\d+/i.exec(stream);
          if (match) {
            const source = match[0];
            const streamLastTime = await pryv.getStreamLastSyncTime(this.pryvEndpoint, [stream]);
            if (!streamsTimestamp[source] || streamsTimestamp[source] < streamLastTime) streamsTimestamp[source] = streamLastTime;
          }
        })
      );
    } catch (e) {
      console.log(e);
    }

    return streamsTimestamp;
  }
}

module.exports = Sync;

