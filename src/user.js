const thryve = require('./thryve.js');
const storage = require('./storage.js');

thryve.userInfo('664b0b69c0fb04c6881ba16eaef9c789').then(
  function (res) {
    console.log(res.body);
  },
  function (err) {
    console.log(err);
  }
  )


/**
 * update all users with a lastSynch older that now - delay in miliseconds
 */
exports.checkForupdate = function (delay) {
  const ulist = storage.getAllSynchedBefore(delay);
  console.log('zzzzzz', ulist);
  ulist.map(async function (user) { 
    try {
      result = await thryve.dynamicValues(user.thryveToken, new Date(user.lastSynch), new Date());
      console.log('Result', result.body);

    } catch (error) {
      console.log('Error', error);
    }

  });
}