const {
    Controller,
    METHOD
} = require('../core/Controller');
const config = require('../config');
const Error = require('../core/Error');
const UserService = require('../services/usersService');
const MigrationService = require('../services/migrationService');

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
            next(new Error("Trigger disabled", 200));
        }

        const { authorization } = req.headers;
        const {
            sourceUpdate: data
        } = req.body;

        if(authorization !== config.get('trigger:authKey')) {
            next(new Error("Invalid Auth Key", 401));
        }

        if(!data || !data.partnerUserID || !data.createdAt || !data.dataSource) {
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
            pryvUsername
        } = user;

        const migrationService = new MigrationService();
        try {
            await migrationService.migrateUser(pryvUsername, data.createdAt, data.dataSource);
        } catch (e) {
            next(new Error(e.message, 500));
        }

        res.json({status: "ok"});
    }
}

module.exports = new TriggerController();
