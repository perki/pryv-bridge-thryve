const request = require('superagent');
const config = require('../config');

const chunkSize = 1000;
class PryvService {

    checkUser(pryvUsername, pryvToken) {
        const url = `http://${pryvUsername}.${config.get('priv:baseDomen')}/accesses?auth=${pryvToken}`;
        return request
            .get(url);
    }

    async postStreamsAndEvents (pryvUsername, pryvToken, streamsAndEvents) {
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

        const url = `https://${pryvUsername}.${config.get('priv:baseDomen')}?auth=${pryvToken}`;
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
