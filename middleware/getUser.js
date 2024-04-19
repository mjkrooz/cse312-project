const express = require('express')
const app = express();
const User = require('../models/user')
const crypto = require('crypto')

async function getUserInstance(sessionToken) {

    if (sessionToken !== null) {

        // Look for the user corresponding to the auth token.

        const user = await User.findOne({"sessionToken": crypto.createHash('sha256').update(sessionToken).digest('hex')});

        // The user will either be null (guest) if no matching token found, or will be a User object.

        return user;
    }

    // No token to try matching against, guest by default.

    return null;
}

async function getUser(req, res, next) {

    // Get the user if the session cookie exists.

    let user = null;

    if ('sessionToken' in req.cookies) {

        // Get the user instance if a session token was provided.

        user = await getUserInstance(req.cookies.sessionToken);
    }

    req.cse312.user = user;

    next();
}

module.exports = {getUser, getUserInstance};