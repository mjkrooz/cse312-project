const mongoose = require('mongoose')

const postSchema = new mongoose.Schema(
    {
        // ObjectId of the user that made the blog post.

        user_id: {
            type: Schema.ObjectId,
            required: true
        },

        // Title of the blog post.

        title: {
            type: String,
            required: true
        },

        // Optional image to show below the title. This will either be a link to an image in the public folder (starting with /),
        // or a link to an external image (starting with http/s). Use this value for the `src` tag in the `img` element.

        banner: {
            type: String,
        },

        // The article content itself.

        content: {
            type: String,
            required: true
        },
 
        // A short blurb to show on the front page.

        blurb: {
            type: String,
            required: true
        }
    }
)

const Post = mongoose.model('Post', postSchema)

module.exports = Post
