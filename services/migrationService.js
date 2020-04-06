const UserService = require('./usersService');
const ThryveService = require('./thryveService');
const PryvService = require('./pryvService');
const logger = require('../utils/logger');

const {
    tsToDate,
    getPeriodAgo,
    getCurrentDate
} = require('../utils/periods');
const convertor = require('./convertor');

class MigrationService {
    async run() {
        const userService = new UserService();
        const thryveService = new ThryveService();
        const pryvService = new PryvService();
        const usersToMigrate = userService.getAllForMigration();

        for(let uIndex = 0; uIndex < usersToMigrate.length; uIndex++) {
            const {
                lastMigrated,
                pryvUsername,
                thryveToken,
                pryvToken,
                accountHost
            } = usersToMigrate[uIndex];
            const streamList = [];
            const streamMap = {};
            const events = [];

            logger.info("Processing user: " + pryvUsername);

            const startDate = lastMigrated === 0
                ? getPeriodAgo()
                : tsToDate(lastMigrated);
            const endDate = getCurrentDate();
            let dynamicsResult = null;
            try {
                dynamicsResult = await thryveService.getDynamicValues(thryveToken, startDate, endDate, false, -1);
            } catch (e) {
                logger.error(e);
                logger.error('Error getting data from Thryve for user: ' + pryvUsername);
                continue;
            }

            if(!dynamicsResult.body[0].dataSources || dynamicsResult.body[0].dataSources.length === 0 ) {
                logger.warn("No data for user: " + pryvUsername);
                continue;
            }

            const context = { combinations : {} };
            const dataSources = dynamicsResult.body[0].dataSources;
            for(let i = 0; i < dataSources.length; i++) {
                const {
                    dataSource,
                    data
                } = dataSources[i];
                if (!dataSource) {
                    logger.error('Invalid datasource content. ' + dataSource);
                    continue;
                }
                if (!data) {
                    logger.error('Invalid data content: ' + data);
                    continue;
                }

                for (let j = 0; j < data.length; j++) {
                    const res = convertor.thryveToPryv(dataSource, data[j], context);
                    if(!res) break;
                    events.push(res.event);
                    res.streams.map(function (stream) {
                        if (streamMap[stream.id]) return;
                        streamList.push(stream);
                        streamMap[stream.id] = stream;
                    });
                }

                let resPryv = null;
                try {
                    // post to pryv
                    resPryv = await pryvService.postStreamsAndEvents(
                            pryvToken,
                            accountHost,
                            { streams: streamList, events: events }
                        );
                    logger.info("Pryv post success for user: " + pryvUsername);
                    userService.setLastMigratedData(pryvUsername);
                } catch (error) {
                    logger.error(error);
                    throw new Error('Error while connecting to Pryv');
                }

            }
        }
    }
}


module.exports = MigrationService;
