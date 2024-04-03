const express = require('express')
const app = express();
const User = require('../models/user')
const crypto = require('crypto')

/**
 * Require and validate a CSRF token within the request body, which is expected to be JSON.
 * 
 * If the token is invalid, a 403 response is sent.
 * 
 * Requires the use of `authenticate` middleware so that `req.cse312.user` is populated. Note that that
 * also means only logged-in users are able to be validated and guests will be declined automatically.
 * That can be bypassed by using `getUser` middleware instead, which then allows guests to always be
 * allowed to post regardless of CSRF token validity.
 */
function validateCSRF(req, res, next) {

    // No auth token, 403.

    if (!('csrfToken' in req.body)) {

        return res.status(403).send({error: "Missing required 'csrfToken' in request body."});
    }

    // Verify that the given CSRF token matches that of the current user.

    if (req.cse312.user.csrfToken !== req.body.csrfToken) {

        return res.status(403).send({error: "Invalid 'csrfToken'."});
    }

    // Valid CSRF token, continue.

    next();
}

/**
 * Generate a CSRF token. Note that this requires `authenticate` or `getUser` middleware to populate
 * the current user, but is not required.
 */
async function generateCSRF(req, res, next) {

    // If there is a current user, create and save a CSRF token to their database record.

    if ('cse312' in req && 'user' in req.cse312 && req.cse312.user !== null) {

        const csrfToken = crypto.createHash('sha256').update(req.cookies.sessionToken).digest('hex');

        req.cse312.user.csrfToken = csrfToken;

        await req.cse312.user.save();
    }

    next();
}

module.exports = {validateCSRF, generateCSRF};