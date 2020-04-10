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
            ThryveToken: thryveToken,
            PryvToken: pryvToken,
            AccountName: pryvUsername,
            AccountHost: accountHost
        } = req.body;

        if(!thryveToken || !pryvToken || !pryvUsername || !accountHost) {
            return next(new Error('Invalid parameters', 400));
        }

        const userService = new UserService();
        const thryveService = new ThryveService();
        const pryvService = new PryvService();
        let thryveUserInfo;
        try {
            thryveUserInfo = await thryveService.userInfo(thryveToken);
        } catch (e) {
            logger.error("API addUser. Invalid thryve user.");
            if(e.rawResponse.indexOf('AuthenticationToken') > -1) {
                return next(new Error('Invalid thryve user', 400));
            } else {
                return next(new Error('Something was wrong', 400));
            }
        }

        if(thryveUserInfo.body[0].partnerUserID !== pryvUsername) {
            logger.error("Invalid user name " + pryvUsername);
            return next(new Error('Invalid user name', 400));
        }

        try {
            await pryvService.checkUser(pryvUsername, pryvToken, accountHost);
        } catch (e) {
            logger.error('Invalid pryv token or user');
            return next(new Error('Invalid pryv token or user', 400));
        }


        userService.addUser({
            thryveToken,
            pryvToken,
            pryvUsername,
            accountHost
        });

        return res.json({status: "ok"});
    }
}

module.exports = new UsersController();
