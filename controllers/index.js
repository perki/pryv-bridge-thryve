const { invokeMap } = require('lodash');
const DefaultController = require('./defaultController');
const UsersController = require('./usersController');
const TriggerController = require('./triggerController');

const controllers = {
    DefaultController,
    UsersController,
    TriggerController
};

module.exports = function initControllers(router) {
    invokeMap(controllers, 'initRoutes', router);
};
