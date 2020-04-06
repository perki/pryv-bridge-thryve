const request = require('superagent');
const config = require('../config');

const chunkSize = 1000;
class PryvService {

    checkUser(pryvUsername, pryvToken, accountHost) {
        const url = `${accountHost}accesses?auth=${pryvToken}`;
        return request
            .get(url);
    }

    async postStreamsAndEvents (pryvToken, accountHost, streamsAndEvents) {
        const batch = [];
        streamsAndEvents.streams.map(function (stream) {
            batch.push({
                method: 'streams.create',
                params: stream
            })
        });

        streamsAndEvents.events.map(function (event) {
            batch.push({
                method: 'events.create',
                params: event
            })
        });

        const url = `${accountHost}?auth=${pryvToken}`;
        const res = [];
        while (batch.length > 0) {
            const thisBatch = batch.splice(0, chunkSize);
            const resRequest = await request.post(url)
                .send(thisBatch);
            res.push(resRequest.body);
        }
        return res;
    };
}

module.exports = PryvService;
