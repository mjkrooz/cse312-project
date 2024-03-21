const express = require('express')

async function appVars(req, res, next) {

    if (!('cse312' in req)) {

        req.cse312 = {};
    }

    next();
}

module.exports = appVars;