const {
    Controller,
    METHOD
} = require('../core/Controller');
const config = require('../config');
const Error = require('../core/Error');
const UserService = require('../services/usersService');
const MigrationService = require('../services/migrationService');
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
        if(!config.get("trigger:enabled")) {
            return next(new Error("Trigger disabled", 500));
        }

        const { authorization } = req.headers;
        const {
            sourceUpdate: data
        } = req.body;

        console.log("Trigger data:", JSON.stringify(data));
        if(authorization !== config.get('trigger:authKey')) {
            return next(new Error("Invalid Auth Key", 401));
        }

        if(!data || !data.partnerUserID || !data.dataSource) {
            return next(new Error("No data in request", 400));
        }

        const userService = new UserService();
        const user = userService.getUserByName(data.partnerUserID);
        if(!user) {
            logger.warn("User not found: " + data.partnerUserID);
            return next(new Error("User not found", 404));
        }

        const migrationService = new MigrationService();
        try {
            await migrationService.migrateUser(user, data.dataSource, data.startTimestamp, data.endTimestamp);
        } catch (e) {
            logger.error(e.message);
            return next(new Error(e.message, 500));
        }

        logger.info("User " + data.partnerUserID + " processed.");
        return res.json({status: "ok"});
    }
}

module.exports = new TriggerController();
