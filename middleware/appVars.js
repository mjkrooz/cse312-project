const express = require('express')

async function appVars(req, res, next) {

    // If "cse312" doesn't exist in the `req` object, add it as an empty object.
    // This is later used with, for instance, the `getUser` middleware to set `req.cse312.user`.

    if (!('cse312' in req)) {

        req.cse312 = {};
    }

    next();
}

module.exports = appVars;