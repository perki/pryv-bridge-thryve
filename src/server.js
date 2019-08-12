const express = require('express')
const config = require('./config.js')
const app = express()
app.use(require('body-parser').json());

const user = require('./user.js');
const storage = require('./storage.js');

const port = config.get('server:port')

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/user', (req, res) => {
  storage.addUser(req.body.pryv, req.body.thryveToken);
  res.send({result: 'OK'})
})

const request = require('superagent');

user.checkForupdate(1).then(res => { 
  console.log('checkForupdate: ' + res);
});

app.listen(port, () => console.log(`Thryve <> Pryv bridge listening on port ${port}!`))