const { Controller, METHOD } = require('../core/Controller');

class DefaultController extends Controller {
    get routes() {
        return [
            {
                route: '/',
                method: METHOD.GET,
                handler: this.defaultRoute
            }
        ]
    }

    defaultRoute(req, res, next) {
        return res.json({message: "Default Route"});
    }
}

module.exports = new DefaultController();
