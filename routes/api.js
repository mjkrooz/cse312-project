
/**
 * 
 * 
 * Blog Post API Endpoints
 * 
 * 
 */

const express = require('express');
const validator = require('validator');
const apiRoutes = express.Router();
const authenticate = require('../middleware/authenticate');
const Post = require('../models/post');
const { Comment, Report } = require('../models/comment');
const User = require('../models/user');
const {validateCSRF} = require('../middleware/csrf');
const multer = require('multer');
const path = require('path');
const { execSync } = require('child_process');
const nodecron = require("node-cron");
const cron = require("cron");
const { unlink } = require("node:fs");

function getMimetype(filepath) {
  try {
    const stdout = execSync('file --mime-type ' + filepath, { encoding: 'utf-8' });

    return (stdout.split(' ')[1]).trim();
  } catch (error) {
    console.error(error);
    return "error";
  }
}

const storage = multer.diskStorage({
  destination: function (req,file,cb) {
    media_path = path.join(__dirname,'../src/public/banner-uploads') //save the image to src/public/
    cb(null,media_path)
  },
  filename: function (req,file,cb) {
    cb(null,Date.now()+ path.extname(file.originalname)) //generate name for the file
  }
})
const upload = multer({
  storage:storage,
  fileFilter(req, file, cb) {

    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {

      return cb(null, true)
    }

    return cb(new Error('Invalid upload, must be an image'), false)
  }
});
/**
 * GET /api/v1/posts
 * 
 * Get all blog posts.
 */
apiRoutes.get('/posts', async (req, res) => {

  const posts = await Post.find({scheduled: 0});

  return res.send(posts);
});

/**
 * POST /api/v1/posts
 * 
 * Create a new blog post.
 */
apiRoutes.post('/posts', upload.single('banner'), authenticate, validateCSRF, async (req, res) => {

  try {

    // Verify the schedule is in the future.

    const scheduledDatetime = new Date(Date.parse(req.body.scheduledDatetime) + 100);
    let scheduled = false;

    if (scheduledDatetime !== "Invalid Date" && scheduledDatetime.getTime() > Date.now() + 100) {

      console.log('Scheduling post for: ' + scheduledDatetime.toISOString());
      scheduled = true;
    }

    // Verify mimetype.
    
    const trueMimetype = getMimetype('/root/src/public/banner-uploads/' + req.file.filename);

    if (trueMimetype !== req.file.mimetype) {

      // Delete the intermediate file.

      unlink('/root/src/public/banner-uploads/' + req.file.filename, () => {});

      return res.sendStatus(400);
    }

    // Create the post.

    const post = new Post({
      user_id: req.cse312.user._id,
      title: validator.escape(req.body.title.substring(0, 64)),
      banner: `banner-uploads/${req.file.filename}`, //banner image will be served via app.use(static)
      content: validator.escape(req.body.content.substring(0, 512)),
      blurb: validator.escape(req.body.blurb.substring(0, 128)),
      scheduled: scheduled ? scheduledDatetime.getTime() : 0
    });

    // Save the post.

    await post.save();

    // If scheduled, schedule a cronjob to release the post.

    if (scheduled) {

      const job = new cron.CronJob(scheduledDatetime, async function () {

        console.log('Releasing post from cron');

        post.scheduled = 0;

        await post.save();
      }.bind(post));

      job.start();
    }

    // Send whether or not the post was set to be scheduled, so that the UI can respond accordingly.

    res.status(201).send({scheduled: scheduled});
  } catch (error) {

    console.log(error);

    res.sendStatus(500);
  }
});

/**
 * GET /api/v1/posts/scheduled
 * 
 * Get all scheduled posts made by the current user.
 */

apiRoutes.get('/posts/scheduled', authenticate, async (req, res) => {

  const posts = await Post.find({scheduled: { $gt: 0 }, user_id: req.cse312.user._id});

  return res.send(posts);
});

/**
 * GET /api/v1/posts/scheduled/:id/remaining-time
 * 
 * Get the number of seconds left before the given post is live.
 */

apiRoutes.get('/posts/scheduled/:id/remaining-time', authenticate, async (req, res) => {

  const post = await Post.findOne({_id: req.params.id, user_id: req.cse312.user._id});

  if (post.scheduled === 0) {

    return res.send({remaining: 0});
  }

  const remaining = post.scheduled - Date.now();

  return res.send({remaining: remaining});
});


/**
 * GET /api/v1/posts/:id/comments
 * 
 * Get all comments on a particular blog post.
 */
apiRoutes.get('/posts/:id/comments', async (req, res) => {

  const comments = await Comment.find({"post_id": req.params.id, "deleted": false});

  if (comments.length == 0) {

    return res.sendStatus(404);
  }

  res.send(comments);
});

async function createComment(postId, user, commentBody) {

  // Verify that the blog post actually exists.

  try {

    const post = await Post.findById(postId);

    if (post === null) {
  
      throw new Error('404');
    }

    // Create the comment.
  
    const comment = new Comment({
      post_id: postId,
      user_id: user._id,
      comment: validator.escape(commentBody.substring(0, 512))
    });
  
    // Save the comment.
  
    await comment.save();
  
    const output = {
      _id: comment._id,
      post_id: comment.post_id,
      user_id: comment.user_id,
      comment: comment.comment
    };

    return output;
  } catch (error) {

    // Pass 404 upwards.

    if (error.message === '404') {

      throw error;
    }

    // Wasn't a 404, send 500.

    console.log(error);

    throw new Error('500'); // TODO: check if specifically a BSON error then 404?
  }
}

/**
 * POST /api/v1/posts/:id/comments
 * 
 * Create a comment on a particular blog post.
 */
apiRoutes.post('/posts/:id/comments', authenticate, validateCSRF, async (req, res) => {

  // Verify that the blog post actually exists.

  try {

    const output = createComment(req.params.id, req.cse312.user, req.body.comment);

    res.status(201).send(output);
  } catch (error) {

    if (error.message === '404') {
      
      return res.status(404).send({error: "Blog post not found"});
    }

    return res.sendStatus(500);
  }
});

/**
 * GET /api/v1/comments/:id
 * 
 * Get a specific comment from its ID.
 */
apiRoutes.get('/comments/:id', async (req, res) => {

  const comment = await Comment.findById(req.params.id);

  if (comment == null) {

    return res.sendStatus(404);
  }

  const output = {
    _id: comment._id,
    post_id: comment.post_id,
    user_id: comment.user_id,
    comment: comment.comment
  };

  res.send(output);
})

/**
 * DELETE /api/v1/posts/:id/comments
 * 
 * Delete a specific comment. Requires the writer of the comment to be the deleter.
 */
apiRoutes.delete('/comments/:id', authenticate, validateCSRF, async (req, res) => {

  const comment = await Comment.findById(req.params.id);

  if (comment == null) {

    return res.sendStatus(404);
  }

  if (!comment.user_id.equals(req.cse312.user._id)) {

    return res.sendStatus(403);
  }

  await Comment.deleteOne({'_id': req.params.id});

  res.sendStatus(204);
});

apiRoutes.delete('/posts/:id',authenticate,validateCSRF,async(req,res)=> {
  
  const blog = await Post.findById(req.params.id)

  if (blog == null){
    return res.sendStatus(404);
  }
   
  await Post.deleteOne({'_id': req.params.id});

  res.sendStatus(204)
})
/**
 * POST /api/v1/comments/:id/report
 * 
 * Report a specific comment from its ID.
 */
apiRoutes.post('/comments/:id/report', authenticate, validateCSRF, async (req, res) => {

  // Verify that the comment actually exists.

  let comment = null;

  try {

    comment = await Comment.findById(req.params.id);

    if (comment === null) {
  
      return res.status(404).send({error: "Comment not found"});
    }

    // Create the report.
  
    const report = new Report({
      reporter: req.cse312.user._id,
      report: validator.escape(req.body.report.substring(0, 64))
    });
  
    // Save the report.
  
    comment.reports.push(report);
  
    await comment.save();
  
    const output = {
      _id: report._id,
      reporter: report.reporter,
      report: report.report
    };
  
    res.status(201).send(output);
  } catch (error) {

    console.log(error);

    return res.sendStatus(500); // TODO: check if BSON error then 404?
  }
});

/**
 * GET /api/v1/users/:id
 * 
 * Get a user by their ID.
 */
apiRoutes.get('/users/:id', async (req, res) => {

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
apiRoutes.get('/seed', async (req, res) => {

  // Seed users.

  const user1 = new User({
    "username": "usera",
    "passwordHash": "$2b$10$ofCWJhmH9BuhscVZQ6IlEeE.V6VXM3Dz7eU3qwCXK4r5cOBllJr.u" // Changeme1!
  });
  
  const user2 = new User({
    "username": "userb",
    "passwordHash": "$2b$10$ofCWJhmH9BuhscVZQ6IlEeE.V6VXM3Dz7eU3qwCXK4r5cOBllJr.u" // Changeme1!
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
  await comment3.save();

  res.redirect('/');
})

module.exports = {apiRoutes, createComment}
