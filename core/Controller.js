const logger = require('../utils/logger');

const METHOD = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete'
};


const asyncMiddleware = fn =>
    (req, res, next) => {
        Promise.resolve()
            .then(() => fn(req, res, next))
            .catch(next);
    };

class Controller {

    initRoutes(router) {
        this.routes.forEach(config => {
            logger.info('Controller init', config);
            const method = config.method || METHOD.GET;
            const args = [config.route];

            router[method].apply(router, [...args, asyncMiddleware(config.handler)]);
        });
    }
}

module.exports = {
    METHOD,
    Controller
};
