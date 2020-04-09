const {
    Controller,
    METHOD
} = require('../core/Controller');
const config = require('../config');
const Error = require('../core/Error');
const UserService = require('../services/usersService');
const convertor = require('../services/convertor');
const PryvService = require('../services/pryvService');
const logger = require('../utils/logger');

class TriggerController extends Controller {
    get routes() {
        return [
            {
                route: '/trigger',
                method: METHOD.POST,
                handler: this.trigger
            }
        ]
    }

    async trigger(req, res, next) {
        const streamList = [];
        const streamMap = {};
        const events = [];
        const context = { combinations : {} };
        const { authorization } = req.headers;
        const {
            sourceUpdate: data
        } = req.body;

        if(authorization !== config.get('trigger:authKey')) {
            next(new Error("Invalid Auth Key", 401));
        }

        if(!data || !data.partnerUserID) {
            next(new Error("No data in request", 400));
        }

        console.log(JSON.stringify(data));
        const userService = new UserService();
        const user = userService.getUserByName(data.partnerUserID);
        console.log("User", user);
        if(!user) {
            next(new Error("User not found", 404));
        }
        const {
            pryvUsername,
            pryvToken,
            accountHost
        } = user;

        const convertResult = convertor.thryveToPryv(data.dataSource, data, context);
        if(!convertResult) {
            next(new Error("Impossible to convert this data", 400));
        }
        events.push(convertResult.event);
        convertResult.streams.map(function (stream) {
            if (streamMap[stream.id]) return;
            streamList.push(stream);
            streamMap[stream.id] = stream;
        });

        let resPryv = null;
        const pryvService = new PryvService();
        try {
            // post to pryv
            resPryv = await pryvService.postStreamsAndEvents(
                pryvToken,
                accountHost,
                { streams: streamList, events: events }
            );
            console.log("Send Data:", JSON.stringify({ streams: streamList, events: events }));
            logger.info("Pryv post success for user: " + pryvUsername);
            console.log("Response result:", JSON.stringify(resPryv));
            userService.setLastMigratedData(pryvUsername);
        } catch (error) {
            logger.error(error);
            console.log("Error result:", error);
            next(new Error('Error while connecting to Pryv', 500));
        }
    }
}

module.exports = new TriggerController();
