const {
    Controller,
    METHOD
} = require('../core/Controller');
const Error = require('../core/Error');
const ThryveService = require('../services/thryveService');
const PryvService = require('../services/pryvService');
const UserService = require('../services/usersService');
const logger = require('../utils/logger');

class UsersController extends Controller {

    get routes() {
        return [
            {
                route: '/user',
                method: METHOD.POST,
                handler: this.addUser
            }
        ]
    }

    async addUser(req, res, next) {
        const {
            thryveToken,
            pryvToken,
            pryvUsername
        } = req.body;

        if(!thryveToken || !pryvToken || !pryvUsername) {
            return next(new Error('Invalid parameters', 400));
        }

        const userService = new UserService();
        const thryveService = new ThryveService();
        const pryvService = new PryvService();
        let thryveUserInfo;
        try {
            thryveUserInfo = await thryveService.userInfo(thryveToken);
        } catch (e) {
            logger.error("API addUser. Invalid thryve user", e);
            if(e.rawResponse.indexOf('AuthenticationToken') > -1) {
                return next(new Error('Invalid thryve user', 400));
            } else {
                return next(new Error('Something was wrong', 400));
            }
        }

        if(thryveUserInfo.body[0].partnerUserID !== pryvUsername) {
            return next(new Error('Invalid user name', 400));
        }

        try {
            await pryvService.checkUser(pryvUsername, pryvToken);
        } catch (e) {
            console.log("error", e);
            return next(new Error('Invalid pryv token or user', 400));
        }


        userService.addUser({
            thryveToken,
            pryvToken,
            pryvUsername
        });

        return res.json({status: "ok"});
    }
}

module.exports = new UsersController();