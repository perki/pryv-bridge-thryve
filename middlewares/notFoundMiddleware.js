const Error = require('../core/Error');

module.exports = (req, res, next) => {
    next(new Error('Resource not found', 404));
};
