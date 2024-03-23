const express = require('express')
const app = express();
const User = require('../models/user')
const crypto = require('crypto')

async function getUser(req, res, next) {

    // Get the user if 

    if ('sessionToken' in req.cookies) {

        // Look for the user corresponding to the auth token.

        const user = await User.findOne({"sessionToken": crypto.createHash('sha256').update(req.cookies.sessionToken).digest('hex')});

        // The user will either be null (guest) if no matching token found, or will be a User object.

        req.cse312.user = user;
    } else {

        // No token to try matching against, guest by default.

        req.cse312.user = null;
    }

    next();
}

module.exports = getUser;