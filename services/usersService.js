const storage = require('./storage');
const {
    getPeriodAgoTimestamp,
    getCurrentDateTimestamp,
    PERIOD
} = require('../utils/periods');

class UsersService {

    addUser(user) {
        storage.user.add(user);
    }

    getAllForMigration() {
        const periodBeforeTimestamp = getPeriodAgoTimestamp(PERIOD.HOUR);
        const requestResult = storage.user.getAllForMigration(periodBeforeTimestamp);
        return requestResult;
    }

    setLastMigratedData(pryvUsername) {
        const current = getCurrentDateTimestamp();
        storage.user.setLastMigrated(pryvUsername, current);
    }

    getUserByName(pryvUsername) {
        return storage.user.get(pryvUsername);
    }
}


module.exports = UsersService;
