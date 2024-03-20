const express = require('express')
const app = express();
const User = require('../models/user')

async function authenticate(req, res, next) {

    // No auth token, 403.

    if (!('token' in req.cookies)) {

        return res.status(403).send({error: "Missing required 'token' cookie."});
    }

    // Look for the user corresponding to the auth token.

    const user = await User.findOne({"username": req.cookies.token}); // TODO: change from "username" to "token" once tokens are implemented.

    // Auth token does not correspond to a particular user.

    if (user === null) {

        return res.status(403).send({error: "Invalid 'token' cookie."});
    }

    // Valid auth token, attach the user to the request and continue.

    req.cse312.user = user;

    next();
}

module.exports = authenticate;