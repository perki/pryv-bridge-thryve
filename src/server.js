require('./startup/db');
require('./startup/cron');

const express = require('express');
const config = require('./config.js');
const routes = require('./routes');

const app = express();
app.use(require('body-parser').json());
app.use('/user', routes.user);
app.use('/trigger', routes.trigger);

app.get('/', (req, res) => res.send('Hello World!'));

app.use((req, res) => res.status(404).end());

const port = config.get('server:port');
app.listen(port, () => console.log(`${(new Date()).toISOString()}: Thryve <> Pryv bridge listening on port ${port}!`));


