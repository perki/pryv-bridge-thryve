const logger = require('../logging.js');
const express = require('express');
const router = express.Router();
const {handleTrigger} = require('../handlers/trigger');

router.post('/', async (req, res) => {
  if (!isTokenCorrect(req.body)) {
    return res.status(400).send('Check authenticationToken');
  }

  try {
    const result = await handleTrigger(req.body);
    return res.status(200).send({result: 'OK'});
  } catch (error) {
    logger.error('Error Trigger Res: ', error);
    if (error.code) {
      return res.status(error.code).send(error.msg);
    }
    res.status(500).send('Something broke!');
  }
});

function isTokenCorrect(body) {
  return body.sourceUpdate && body.sourceUpdate.authenticationToken && body.sourceUpdate.authenticationToken.length > 31;
}

module.exports = router;
