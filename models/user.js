const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            minlength:3,
            unique: true
        },

        passwordHash: String
    }
)

const User = mongoose.model('User',userSchema)

module.exports = User
