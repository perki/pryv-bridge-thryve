const storage = require('./storage');
const {
    getPeriodAgoTimestamp,
    getCurrentDateTimestamp
} = require('../utils/periods');

class UsersService {

    addUser(user) {
        storage.user.add(user);
    }

    getAllForMigration() {
        const dayBeforeTimestamp = getPeriodAgoTimestamp();
        const requestResult = storage.user.getAllForMigration(dayBeforeTimestamp);
        return requestResult;
    }

    setLastMigratedData(pryvUsername) {
        const current = getCurrentDateTimestamp();
        storage.user.setLastMigrated(pryvUsername, current);
    }
}


module.exports = UsersService;
