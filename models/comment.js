const mongoose = require('mongoose')

// Report schema to be attached to a comment.

const reportSchema = new mongoose.Schema({

    // The ObjectId of the user that submitted the report.
    // If empty, a guest reported it? TODO: determine if we need guest interactions.

    reporter: {
        type: mongoose.Schema.ObjectId,
        required: true
    },

    // The report itself. Can be empty if the message is obviously in need of moderation.

    report: {
        type: String,
        default: ""
    },

    // Whether or not the report is considered complete, which does not necessarily mean the comment was deleted.

    resolved: {
        type: Boolean,
        default: false
    }
})

// The full comment schema.

const commentSchema = new mongoose.Schema(
    {
        // ObjectId of the user that made the comment.

        user_id: {
            type: mongoose.Schema.ObjectId,
            required: true
        },

        // ObjectId of the blog post that the comment was made on.

        post_id: {
            type: mongoose.Schema.ObjectId,
            required: true
        },

        // The comment content itself.

        comment: {
            type: String,
            required: true
        },

        // List of reports on the comment. Should default to an empty list.

        reports: {
            type: [reportSchema],
            default: []
        },

        // Whether or not the comment was deleted via moderation action.

        deleted: {
            type: Boolean,
            default: false
        }
    }
)

const Comment = mongoose.model('Comment', commentSchema)
const Report = mongoose.model('Report', reportSchema)

module.exports = { Comment, Report }
