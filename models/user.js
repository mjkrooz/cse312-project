const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            minlength:3,
        },

        passwordHash: String,
        
        salt: String,

        sessionToken: {
            type: String,
            default: ''
        },

        csrfToken: {
            type: String,
            default: ''
        }
    }
)

const User = mongoose.model('User',userSchema)

module.exports = User
