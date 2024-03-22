require('dotenv').config();
const loginRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

loginRouter.post('/', async (request, response) => {
    const { username, password } = request.body;
    const user = await User.findOne({ username });

    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash);

    if (!user || !passwordCorrect) {
        return response.status(401).json({ error: 'Invalid username/password' });
    }

    const token = jwt.sign({ username: user.username, id: user._id }, process.env.SECRET, { expiresIn: '1h' });

    response.status(201).json({ token, username: user.username, name: user.name, message: 'SUCCESS' });
});

module.exports = loginRouter;
