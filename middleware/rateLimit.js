const express = require('express')
const app = express();

const ipTracking = {};

async function rateLimit(req, res, next) {

    // Get the IP address (either forwarded through nginx or directly).

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Increment visit counter.

    if (!(ip in ipTracking)) {

        ipTracking[ip] = {
            visits: 1,
            last_visit: Date.now(),
            blocked: false
        };
    } else {
        ipTracking[ip].visits = ipTracking[ip].visits + 1;
    }

    // If they were blocked and 30 seconds have passed, unblock them.

    if (ipTracking[ip].blocked && Date.now() - ipTracking[ip].last_visit > 30000) {

        ipTracking[ip].visits = 1;
        ipTracking[ip].last_visit = Date.now();
        ipTracking[ip].blocked = false;
    }

    console.log(ipTracking);

    // If they are blocked, 429.

    if (ipTracking[ip].blocked) {
        
        return res.sendStatus('429');
    } else if (Date.now() - ipTracking[ip].last_visit > 10000) {

        // If their last visit was more than 10 seconds away, reset their visit counter.

        ipTracking[ip].visits = 1;
        ipTracking[ip].last_visit = Date.now();
    } else if (ipTracking[ip].visits > 50) {

        // If they have visited 50+ times within a 10 seconds period, block them.

        ipTracking[ip].last_visit = Date.now();
        ipTracking[ip].blocked = true;

        return res.sendStatus('429');
    }

    next();
}

module.exports = rateLimit;