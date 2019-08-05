const thryve = require('./thryve.js');


thryve.userInfo('664b0b69c0fb04c6881ba16eaef9c789').then(
  function (res) {
    console.log(res.body);
  },
  function (err) {
    console.log(err);
  }
  )

thryve.dynamicValues('664b0b69c0fb04c6881ba16eaef9c789', new Date(0), new Date()).then(
  function (res) {
    console.log(res.body);
  },
  function (err) {
    console.log(err);
  }
)