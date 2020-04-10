const {
    addDays,
    getUnixTime,
    fromUnixTime,
    addHours
} = require('date-fns');
const config = require('../config');

const PERIOD = {
    DAY: 'day',
    HOUR: 'hour'
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
        case PERIOD.HOUR:
            return addHours(getCurrentDate(), config.get('cron:period'));

        case PERIOD.DAY:
        default:
            return addDays(getCurrentDate(), config.get('cron:period'));
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
    PERIOD
};


