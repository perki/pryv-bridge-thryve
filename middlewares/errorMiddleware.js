const { isPlainObject } = require('lodash');
const Error = require ('../core/Error');

module.exports = (err, req, res, next) => {
    if (err instanceof Error) {
        return res
            .status(err.status)
            .json({
                status: err.status,
                errors: isPlainObject(err.statusMessage)
                    ? err.statusMessage
                    : err.statusMessage.toString()
            })
    }

    return res
        .status(500)
        .json({
            errors: err.toString()
        });
};
