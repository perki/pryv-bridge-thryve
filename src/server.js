const express = require('express')
const config = require('./config.js')
const app = express()
app.use(require('body-parser').json());

const user = require('./user.js');
const storage = require('./storage.js');

const port = config.get('server:port')

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/user', (req, res) => {
  storage.addUser(req.body.pryvEndpoint, req.body.thryveToken);
  user.initUser({ pryvEndpoint: req.body.pryvEndpoint, thryveToken: req.body.thryveToken});
  res.send({result: 'OK'})
});

app.post('/trigger', async (req, res) => {
  try { 
    console.log(req.body);
    const result = await user.handleTrigger(req.body);
    return res.status(200).send('OK');
  } catch (error) { 
    console.log('Error Trigger Res: ', error);
    res.status(500).send('Something broke!');
  };
});

const request = require('superagent');

app.post('/auto', async (req, res) => { 
  try { 
    storage.addSyncSourceForuser(req.body.pryvEndpoint, req.body.source);
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send(error.message);
  }
});
 

app.listen(port, () => console.log(`Thryve <> Pryv bridge listening on port ${port}!`))