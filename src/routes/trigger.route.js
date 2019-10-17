const logger = require('../logging.js');
const express = require('express');
const router = express.Router();
const {handleTrigger} = require('../handlers/trigger');

router.post('/', async (req, res) => {
  try {
    const result = await handleTrigger(req.body);
    return res.status(200).send({result: 'OK'});
  } catch (error) {
    logger.error('Error Trigger Res: ', error);
    res.status(500).send('Something broke!');
  }
});

module.exports = router;
