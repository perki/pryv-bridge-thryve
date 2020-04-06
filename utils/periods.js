const {
    addDays,
    getUnixTime,
    fromUnixTime
} = require('date-fns');
const config = require('../config');

const getCurrentDate = () => {
    return new Date();
};

const getCurrentDateTimestamp = () => {
    return getUnixTime(getCurrentDate());
};

const getPeriodAgoTimestamp = () => {
    const dayAgoDate = addDays(getCurrentDate(), config.get('cron:period'));
    return getUnixTime(dayAgoDate);
};

const getPeriodAgo = () => {
    return addDays(getCurrentDate(), config.get('cron:period'));
};

const tsToDate = (ts) => {
    return fromUnixTime(ts);
};

module.exports = {
    getCurrentDate,
    getCurrentDateTimestamp,
    getPeriodAgoTimestamp,
    getPeriodAgo,
    tsToDate
};


