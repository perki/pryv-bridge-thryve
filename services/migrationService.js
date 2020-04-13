const UserService = require('./usersService');
const ThryveService = require('./thryveService');
const PryvService = require('./pryvService');
const logger = require('../utils/logger');
const {
    tsToDate,
    getPeriodAgo,
    getCurrentDate,
    getAgo,
    PERIOD
} = require('../utils/periods');
const convertor = require('./convertor');

class MigrationService {
    async run() {
        const userService = new UserService();
        const usersToMigrate = userService.getAllForMigration();

        for(let uIndex = 0; uIndex < usersToMigrate.length; uIndex++) {
            try {
                await this.migrateUser(usersToMigrate[uIndex]);
            } catch (e) {
                logger.error(e.message);
            }
        }
    }


    async migrateUser(user, thryeveSourceCode = -1, createdAt = null) {
        const {
            lastMigrated,
            pryvUsername,
            thryveToken,
            pryvToken,
            accountHost
        } = user;
        const thryveService = new ThryveService();
        const pryvService = new PryvService();
        const userService = new UserService();
        const streamList = [];
        const streamMap = {};
        const events = [];

        logger.info("Processing user: " + pryvUsername);

        let startDate;
        let endDate;

        if(!createdAt) {
            startDate = lastMigrated === 0
                ? getPeriodAgo(PERIOD.HOUR)
                : tsToDate(lastMigrated);
            endDate = getCurrentDate();
        }

        console.log("startDate:", startDate);
        console.log("endDate:", endDate);

        let dynamicsResult = null;
        try {
            dynamicsResult = await thryveService.getDynamicValues(
                thryveToken,
                startDate,
                endDate,
                createdAt ? createdAt : null,
                false,
                thryeveSourceCode );
        } catch (e) {
            logger.error('Error getting data from Thryve for user: ' + pryvUsername);
            userService.setLastMigratedData(pryvUsername);
            throw new Error('Error getting data from Thryve for user: ' + pryvUsernam);
        }

        if(!dynamicsResult.body[0].dataSources || dynamicsResult.body[0].dataSources.length === 0 ) {
            logger.warn("No data for user: " + pryvUsername);
            userService.setLastMigratedData(pryvUsername);
            throw new Error("No data for user: " + pryvUsername);
        }

        console.log("dataSource:", JSON.stringify(dynamicsResult.body[0].dataSources));

        const context = { combinations : {} };
        const dataSources = dynamicsResult.body[0].dataSources;
        for(let i = 0; i < dataSources.length; i++) {
            const {
                dataSource,
                data
            } = dataSources[i];
            if (!dataSource) {
                logger.error('Invalid datasource content. ' + dataSource);
                userService.setLastMigratedData(pryvUsername);
                continue;
            }
            if (!data) {
                logger.error('Invalid data content: ' + data);
                userService.setLastMigratedData(pryvUsername);
                continue;
            }

            for (let j = 0; j < data.length; j++) {
                /*if(createdAt && data[j].createdAt !== createdAt) {
                    logger.warn("Event not found in " + JSON.stringify(data[j]));
                    continue;
                }*/
                logger.info("Event found in " + JSON.stringify(data[j]));
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


module.exports = MigrationService;
