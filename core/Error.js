class Error {
    constructor(statusMessage, status) {
        this.status = 500;
        this.statusMessage = 'Internal Error';

        if (statusMessage) {
            this.statusMessage = statusMessage;
        }

        if (status) {
            this.status = status;
        }
    }
}

module.exports = Error;
