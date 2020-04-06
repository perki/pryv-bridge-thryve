const Storage = require('./storage');

const usersTable = "users";

class User extends Storage {
    constructor(props) {
        super(props);
        this.db
            .prepare(`CREATE TABLE IF NOT EXISTS ${usersTable}
                        (pryvUsername varchar(200) primary key,
                        thryveToken varchar(100),
                        pryvToken varchar(100),
                        lastMigrated integer)`)
            .run();
        this.db
            .prepare(`CREATE UNIQUE INDEX IF NOT EXISTS thryveToken_index ON ${usersTable}(thryveToken)`)
            .run();
        this.db
            .prepare(`CREATE UNIQUE INDEX IF NOT EXISTS privToken_index ON ${usersTable}(pryvToken)`)
            .run();

    }


    add(user) {
        const {
            thryveToken,
            pryvToken,
            pryvUsername
        } = user;

        const selectedUser = this.get(pryvUsername);
        if(selectedUser) {
            this.db
                .prepare(`UPDATE ${usersTable} SET thryveToken = ?, privToken = ? WHERE pryvUsername = ?`)
                .run(thryveToken, pryvToken, pryvUsername);
        } else {
            this.db
                .prepare(`INSERT INTO ${usersTable} (pryvUsername, thryveToken, pryvToken, lastMigrated) VALUES (?, ?, ?, 0)`)
                .run(pryvUsername, thryveToken, pryvToken);
        }
    }

    get(pryvUsername) {
        return this.db
            .prepare(`SELECT * FROM ${usersTable} WHERE pryvUsername = ?`)
            .get(pryvUsername);
    }

    getAllForMigration(lastMigrated) {
        return this.db
            .prepare(`SELECT * FROM ${usersTable} WHERE lastMigrated < ?`)
            .all(lastMigrated);
    }

    setLastMigrated(pryvUsername, time) {
        return this.db
            .prepare(`UPDATE ${usersTable} SET lastMigrated = ? WHERE pryvUsername = ?`)
            .run(time, pryvUsername);
    }
}

const user = new User();

module.exports = user;