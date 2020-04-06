const { invokeMap } = require('lodash');
const DefaultController = require('./defaultController');
const UsersController = require('./usersController');

const controllers = {
    DefaultController,
    UsersController
};

module.exports = function initControllers(router) {
    invokeMap(controllers, 'initRoutes', router);
};
