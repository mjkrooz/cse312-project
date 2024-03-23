const express = require('express')
const app = express();
const User = require('../models/user')
const crypto = require('crypto')

async function authenticate(req, res, next) {

    // No auth token, 403.

    if (!('sessionToken' in req.cookies)) {

        return res.status(403).send({error: "Missing required 'sessionToken' cookie."});
    }

    // Look for the user corresponding to the auth token.

    const user = await User.findOne({"sessionToken": crypto.createHash('sha256').update(req.cookies.sessionToken).digest('hex')});

    // Auth token does not correspond to a particular user.

    if (user === null) {

        return res.status(403).send({error: "Invalid 'sessionToken' cookie."});
    }

    // Valid auth token, attach the user to the request and continue.

    req.cse312.user = user;

    next();
}

module.exports = authenticate;