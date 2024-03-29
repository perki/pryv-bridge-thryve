const logger = require('../logging.js');
const express = require('express');
const router = express.Router();
const {initUser, getUser} = require('../handlers/user');

/**
 * Create a User
 */
router.post('/', async (req, res) => {
  if (!req.body.pryvEndpoint || !req.body.thryveToken) {
    res.status(400).send('Check pryvEndpoint and thryveToken fields');
  }

  try {
    await initUser({pryvEndpoint: req.body.pryvEndpoint, thryveToken: req.body.thryveToken});
    res.send({result: 'OK'})
  } catch (e) {
    logger.error('User init error: ', e);
    res.status(500).send('Something went wrong while initializing a user');
  }
});

/**
 * Get Thryve status from a Pryv User endpoint
 */
router.get('/thryve', async (req, res) => {
  try {
    const result = await getUser(req.query.pryvEndpoint);
    if (result === null) res.status(404).send({error: 'User unknown'});
    return res.send({result: result.body[0]});
  } catch (e) {
    res.status(500).send('Unknown error');
    logger.error('Get User error: ', e);
  }
});

module.exports = router;

