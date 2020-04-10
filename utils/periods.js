const {
    addDays,
    getUnixTime,
    fromUnixTime,
    addHours,
    addSeconds,
    addMinutes
} = require('date-fns');
const config = require('../config');

const PERIOD = {
    DAY: 'day',
    HOUR: 'hour',
    MINUTE: 'minute',
    SECOND: 'second'
};

const getCurrentDate = () => {
    return new Date();
};

const getCurrentDateTimestamp = () => {
    return getUnixTime(getCurrentDate());
};

const getPeriodAgoTimestamp = (period = PERIOD.DAY) => {
    let res;
    switch (period) {
        case PERIOD.SECOND:
            res = addSeconds(getCurrentDate(), config.get('cron:period'));
            break;

        case PERIOD.MINUTE:
            res = addMinutes(getCurrentDate(), config.get('cron:period'));
            break;

        case PERIOD.HOUR:
            res = addHours(getCurrentDate(), config.get('cron:period'));
            break;

        case PERIOD.DAY:
        default:
            res = addDays(getCurrentDate(), config.get('cron:period'));
            break;
    }

    return getUnixTime(res);
};

const getPeriodAgo = (period = PERIOD.DAY) => {
    switch (period) {
        case PERIOD.SECOND:
            return addSeconds(getCurrentDate(), config.get('cron:period'));

        case PERIOD.MINUTE:
            return  addMinutes(getCurrentDate(), config.get('cron:period'));

        case PERIOD.HOUR:
            return addHours(getCurrentDate(), config.get('cron:period'));

        case PERIOD.DAY:
        default:
            return addDays(getCurrentDate(), config.get('cron:period'));
    }
};

const getAgo = (date, value, period = PERIOD.SECOND) => {
    switch (period) {
        case PERIOD.SECOND:
            return addSeconds(date, value);

        case PERIOD.MINUTE:
            return  addMinutes(date, value);

        case PERIOD.HOUR:
            return addHours(date, value);

        case PERIOD.DAY:
        default:
            return addDays(date, value);
    }
};

const tsToDate = (ts) => {
    return fromUnixTime(ts);
};

const dateToTS = (date) => {
    return getUnixTime(date);
};

module.exports = {
    getCurrentDate,
    getCurrentDateTimestamp,
    getPeriodAgoTimestamp,
    getPeriodAgo,
    tsToDate,
    dateToTS,
    getAgo,
    PERIOD
};


