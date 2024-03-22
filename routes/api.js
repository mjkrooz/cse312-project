/**
 * 
 * 
 * Blog Post API Endpoints
 * 
 * 
 */

const express = require('express');
const validator = require('validator');
const app = express.Router();
const authenticate = require('../middleware/authenticate');
const Post = require('../models/post');
const { Comment, Report } = require('../models/comment');
const User = require('../models/user');

/**
 * GET /api/v1/posts
 * 
 * Get all blog posts.
 */
app.get('/posts', async (req, res) => {

  const posts = await Post.find({});

  return res.send(posts);
});

/**
 * POST /api/v1/posts
 * 
 * Create a new blog post.
 */
app.post('/posts', authenticate, async (req, res) => {

  // Create the post.

  const post = new Post({
    user_id: req.cse312.user._id,
    title: validator.escape(req.body.title),
    content: validator.escape(req.body.content),
    blurb: validator.escape(req.body.blurb)
  });

  // Save the post.

  await post.save();

  res.sendStatus(201); // TODO: return the post contents.
});

/**
 * GET /api/v1/posts/:id/comments
 * 
 * Get all comments on a particular blog post.
 */
app.get('/posts/:id/comments', async (req, res) => {

  const comments = await Comment.find({"post_id": req.params.id, "deleted": false});

  if (comments.length == 0) {

    return res.sendStatus(404);
  }

  res.send(comments);
});

/**
 * POST /api/v1/posts/:id/comments
 * 
 * Create a comment on a particular blog post.
 */
app.post('/posts/:id/comments', authenticate, async (req, res) => {

  // Verify that the blog post actually exists.

  try {

    const post = await Post.findById(req.params.id);

    if (post === null) {
  
      return res.status(404).send({error: "Blog post not found"});
    }
  } catch (error) {

    console.log(error);

    return res.sendStatus(500); // TODO: check if specifically a BSON error then 404?
  }

  // Create the comment.

  const comment = new Comment({
    post_id: req.params.id,
    user_id: req.cse312.user._id,
    comment: validator.escape(req.body.comment)
  });

  // Save the comment.

  await comment.save();

  res.sendStatus(201); // TODO: return the comment contents.
});

/**
 * GET /api/v1/comments/:id
 * 
 * Get a specific comment from its ID.
 */
app.get('/comments/:id', async (req, res) => {

  const comment = await Comment.findById(req.params.id);

  if (comment == null) {

    return res.sendStatus(404);
  }

  res.send(comment);
})

/**
 * POST /api/v1/comments/:id/report
 * 
 * Report a specific comment from its ID.
 */
app.post('/comments/:id/report', authenticate, async (req, res) => {

  // Verify that the comment actually exists.

  let comment = null;

  try {

    comment = await Comment.findById(req.params.id);

    if (comment === null) {
  
      return res.status(404).send({error: "Comment not found"});
    }
  } catch (error) {

    console.log(error);

    return res.sendStatus(500); // TODO: check if BSON error then 404?
  }

  // Create the report.

  const report = new Report({
    reporter: req.cse312.user._id,
    report: validator.escape(req.body.report)
  });

  // Save the report.

  await comment.save();

  res.sendStatus(201); // TODO: return the report contents.
});

/**
 * GET /api/v1/users/:id
 * 
 * Get a user by their ID.
 */
app.get('/users/:id', async (req, res) => {

  const user = await User.findById(req.params.id).select('username');

  if (user == null) {

    return res.sendStatus(404);
  }

  res.send(user);
});

/**
 * GET /api/v1/seed
 * 
 * Seed the database with defauly dummy data.
 */
app.get('/seed', async (req, res) => {

  // Seed users.

  const user1 = new User({
    "username": "usera",
    "passwordHash": "$2b$10$E78kb34I9fphZEBrOvgvau5rskXepffy/FwIKzhAd1Nyc0UPA4AHi" // Changeme1!
  });
  
  const user2 = new User({
    "username": "userb",
    "passwordHash": "$2b$10$E78kb34I9fphZEBrOvgvau5rskXepffy/FwIKzhAd1Nyc0UPA4AHi" // Changeme1!
  });

  await user1.save();
  await user2.save();

  // Seed posts.

  const post1 = new Post({
    "user_id": user1._id,
    "title": "I am in a waterfall",
    "content": "Long Form Content 1",
    "banner": "https://photos.smugmug.com/Years/2022/220184-Nursing-International-Nursing-Day-Niagara-Falls-NY/i-gjQr4ND/0/C5FR2PG3L5rjptXftTvcHw55ncQtGB8CfLnP2KPKF/X3/CC2A3273-X3.jpg",
    "blurb": "lorem ipsum dolar blah blah blah blah blah blah blah"
  });
  const post2 = new Post({
    "user_id": user1._id,
    "title": "I am in a creek",
    "content": "Long Form Content 2",
    "banner": "https://photos.smugmug.com/Years/2023/230354-CAS-Bio-Corey-Krabbenhoft-Mussels-Ellicott-Creek/i-GQpVzCc/0/C9BxhNVntsRnqnSjj5JgFCtJ9xsjrCMqcthrBMpxD/X3/IMG_6768-X3.jpg",
    "blurb": "lorem ipsum dolar blah blah blah blah blah blah blah"
  });

  await post1.save();
  await post2.save();

  // Seed comments.

  const comment1 = new Comment({
    "user_id": user1._id,
    "post_id": post1._id,
    "comment": "This is a test"
  });

  const comment2 = new Comment({
    "user_id": user2._id,
    "post_id": post1._id,
    "comment": "This is a second comment on post 1"
  });

  const comment3 = new Comment({
    "user_id": user2._id,
    "post_id": post1._id,
    "comment": "Hello World"
  });

  await comment1.save();
  await comment2.save();
  await comment3.save();

  // Seed reports.

  const report1 = new Report({
    "reporter": user1._id,
    "report": "This comment is lame"
  });

  comment3.reports.push(report1);
  comment3.save();

  res.redirect('/');
})

module.exports = app;