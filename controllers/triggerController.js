const {
    Controller,
    METHOD
} = require('../core/Controller');

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
        const body = req.body;
        //console.log(JSON.stringify(body));
        console.log(JSON.stringify(req));
    }
}

module.exports = new TriggerController();
