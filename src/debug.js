var util = require('util');


exports.inspect = function inspect() {
  var line = '';
  try {
    throw new Error();
  } catch (e) {
    line = e.stack.split(' at ')[2].trim();
  }
  console.log('\n * dump at: ' + line);
  for (var i = 0; i < arguments.length; i++) {
    console.log('\n' + i + ' ' + util.inspect(arguments[i], true, 10, true) + '\n');
  }
};