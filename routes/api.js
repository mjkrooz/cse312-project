/**
 * 
 * 
 * Blog Post API Endpoints
 * 
 * 
 */

const express = require('express');
const app = express.Router();
const authenticate = require('../middleware/authenticate');
const Post = require('../models/post');
const { Comment, Report } = require('../models/comment');
const User = require('../models/user');

// Get all blog posts.

app.get('/posts', async (req, res) => {

  const posts = await Post.find({});

  return res.send(posts);
});

// Create a new blog post.

app.post('/posts', authenticate, async (req, res) => {

  const post = new Post(req.body);

  post.user_id = req.cse312.user._id;

  await post.save();

  res.sendStatus(201); // TODO: return the post contents.
});

// Get all comments on a particuar blog post.

app.get('/posts/:id/comments', async (req, res) => {

  const comments = await Comment.find({"post_id": req.params.id, "deleted": false});

  res.send(comments);
});

// Create a comment on a particular blog post.
// TODO: sanitization.

app.post('/posts/:id/comments', authenticate, async (req, res) => {

  // Verify that the blog post actually exists.

  try {

    const post = await Post.findById(req.params.id);

    if (post === null) {
  
      return res.status(404).send({error: "Blog post not found"});
    }

    console.log(post);
  } catch (error) {

    console.log(error);

    return res.sendStatus(500); // TODO: check if specifically a BSON error then 404?
  }

  // Create the comment.

  const comment = new Comment(req.body);

  comment.post_id = req.params.id;
  comment.user_id = req.cse312.user._id;

  await comment.save();

  console.log(comment);

  res.sendStatus(201); // TODO: return the comment contents.
});

// Get a specific comment from its ID.

app.get('/comments/:id', async (req, res) => {

  const comment = await Comment.findById(req.params.id);

  console.log(comment);

  res.send(comment);
})

// Report a comment.

app.post('/comments/:id/report', authenticate, async (req, res) => {

  // Verify that the comment actually exists.

  let comment = null;

  try {

    comment = await Comment.findById(req.params.id);

    if (comment === null) {
  
      return res.status(404).send({error: "Comment not found"});
    }

    console.log(comment);
  } catch (error) {

    console.log(error);

    return res.sendStatus(500); // TODO: check if BSON error then 404?
  }

  // Create the report.

  req.body.reporter = req.cse312.user._id;

  const report = new Report(req.body);

  // Attach the report to the comment and save it.

  comment.reports.push(report);

  await comment.save();

  res.sendStatus(201); // TODO: return the report contents.
});

// Get a user by their ID.

app.get('/users/:id', async (req, res) => {

  const user = await User.findById(req.params.id).select('username');

  console.log(user);

  res.send(user);
});

module.exports = app;