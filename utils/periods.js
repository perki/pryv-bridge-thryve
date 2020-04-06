const {
    addDays,
    getUnixTime,
    fromUnixTime
} = require('date-fns');
const config = require('../config');

const currentDate = new Date();

exports.getCurrentDate = function() {
    return currentDate;
};

exports.getCurrentDateTimestamp = function() {
    return getUnixTime(currentDate);
};

exports.getPeriodAgoTimestamp = function () {
    const dayAgoDate = addDays(currentDate, config.get('cron:period'));
    return getUnixTime(dayAgoDate);
};

exports.getPeriodAgo = function() {
    return addDays(currentDate, config.get('cron:period'));
};

exports.tsToDate = function (ts) {
    return fromUnixTime(ts);
};

