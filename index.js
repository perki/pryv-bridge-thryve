const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const config = require('./config')
const middlewares = require('./middlewares');
const initControllers = require ('./controllers');
const { getTrhyveData } = require('./services/cronService');
const logging = require('./utils/logger');

const app = express();
const router = express.Router();
const {
    notFoundMiddleware,
    errorMiddleware
} = middlewares;

app.use(logger('dev'));
app.use(express.urlencoded({ limit: '200mb', extended: true, parameterLimit: 200000 }));
app.use(bodyParser.json({ limit: '24mb' }));

app.use(router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

initControllers(router);

const port = normalizePort(config.get('server:port') || '3000');
app.set('port', port);

app.listen(port,()=>
    logging.info(`Server is listening on port ${port}`));

getTrhyveData.start();
logging.info('Start get thryve data cron job');

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}
