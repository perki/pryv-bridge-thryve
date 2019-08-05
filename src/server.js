const express = require('express')
const config = require('./config.js')
const app = express()

const user = require('./user.js');
const storage = require('./storage.js');

const port = config.get('server:port')

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Thryve <> Pryv bridge listening on port ${port}!`))