const logger = require('../logging.js');
const express = require('express');
const router = express.Router();
const {handleTrigger} = require('../handlers/trigger');

router.post('/', async (req, res) => {
  try {
    if (!req.body.authenticationToken || req.body.authenticationToken.length < 32) {
      res.status(400).send('Check authenticationToken');
    }
    const result = await handleTrigger(req.body);
    return res.status(200).send({result: 'OK'});
  } catch (error) {
    logger.error('Error Trigger Res: ', error);
    if(error.code){
      return res.status(error.code).send(error.msg);
    }
    res.status(500).send('Something broke!');
  }
});

module.exports = router;
