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

/**
 * Not used yet
 */
app.post('/auto', async (req, res) => {
  try {
    // storage.addSyncSourceForUser(req.body.pryvEndpoint, req.body.source); // todo need to be moved to handlers
    res.status(200).send({result: 'OK'});
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const port = config.get('server:port');

app.listen(port, () => console.log(`Thryve <> Pryv bridge listening on port ${port}!`));


