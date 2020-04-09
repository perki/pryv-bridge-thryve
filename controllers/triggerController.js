const {
    Controller,
    METHOD
} = require('../core/Controller');
const config = require('../config');
const Error = require('../core/Error');

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
        const { authorization } = req.headers;
        const {
            sourceUpdate: data
        } = req.body;

        if(authorization !== config.get('trigger:authKey')) {
            next(new Error("Invalid Auth Key", 401));
        }

        console.log(JSON.stringify(data));
    }
}

module.exports = new TriggerController();
