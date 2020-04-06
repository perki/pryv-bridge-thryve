const {
    addDays,
    getUnixTime,
    fromUnixTime
} = require('date-fns');
const config = require('../config');

exports.getCurrentDate = function() {
    return new Date();
};

exports.getCurrentDateTimestamp = function() {
    return getUnixTime(getCurrentDate());
};

exports.getPeriodAgoTimestamp = function () {
    const dayAgoDate = addDays(getCurrentDate(), config.get('cron:period'));
    return getUnixTime(dayAgoDate);
};

exports.getPeriodAgo = function() {
    return addDays(getCurrentDate(), config.get('cron:period'));
};

exports.tsToDate = function (ts) {
    return fromUnixTime(ts);
};

