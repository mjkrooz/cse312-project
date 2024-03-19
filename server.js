const express = require('express')
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const {validatePassword} = require('./util/validate_credentials')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('./models/user')
const Post = require('./models/post')
const { Comment, Report } = require('./models/comment')

app.use(function(req, res, next) {

  mongoose.connect('mongodb://db:27017/cse312');
  res.append('X-Content-Type-Options', 'nosniff');
  next();
});

app.get('/', (req, res) => {

  res.sendFile(__dirname + '/src/public/index.html');
});

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/registration-form', (req, res) => {

  res.sendFile(__dirname + '/src/public/registration.html');

});

app.get('/', (req, res) => {

  res.sendFile(__dirname + '/src/public/index.html');
});

app.get('/function.js',(req,res)=>{
  res.sendFile(__dirname+'/src/public/function.js')
})

app.post('/register',async (req,res)=>{

  const body = req.body

  username = body.username
  password = body.password

  if(!validatePassword(password))
  {
    res.status(401).json({error:'Password too weak, registration failed.'})
  }

  const salt = await bcrypt.genSalt()

  password = password+salt

  password_hash = await bcrypt.hash(password,salt)

  //construct new user using our User mongo model
  const user = new User(
    {
      username,
      password_hash
    }
  )

   // user = await user.save() //save user to our collection

    res.status(302).redirect('/')

    
  

})

/**
 * 
 * 
 * Blog Post API Endpoints
 * 
 * 
 */

// Ensure all API endpoints are parsing the request body as JSON.
// Note that this applies the middleware to all routes that follow it.

app.use(express.json());

// Get all blog posts.

app.get('/api/v1/posts', async (req, res) => {

  const posts = await Post.find({});

  return res.send(posts);
});

// Create a new blog post.

app.post('/api/v1/posts', async (req, res) => {

  const post = new Post(req.body);

  post.user_id = '65f9b0c3da893c266cd903b1'; // TODO: use the current user's user ID.

  console.log(post);

  await post.save();

  res.sendStatus(201); // TODO: return the post contents.
});

// Get all comments on a particuar blog post.

app.get('/api/v1/posts/:id/comments', async (req, res) => {

  const comments = await Comment.find({"post_id": req.params.id, "deleted": false});

  res.send(comments);
});

// Create a comment on a particular blog post.
// TODO: sanitization.

app.post('/api/v1/posts/:id/comments', async (req, res) => {

  // Verify that the blog post actually exists.

  try {

    const post = await Post.findById(req.params.id);

    if (post === null) {
  
      return res.status(404).send({error: "Blog post not found"});
    }

    console.log(post);
  } catch (error) {

    console.log(error);

    return res.sendStatus(500); // TODO: check if BSON error then 404?
  }

  // Create the comment.

  const comment = new Comment(req.body);

  comment.post_id = req.params.id;
  comment.user_id = '65f9b0c3da893c266cd903b1'; // TODO: use the current user's user ID.

  await comment.save();

  console.log(comment);

  res.sendStatus(201); // TODO: return the comment contents.
});

// Get a specific comment from its ID.

app.get('/api/v1/comments/:id', async (req, res) => {

  const comment = await Comment.findById(req.params.id);

  console.log(comment);

  res.send(comment);
})

// Report a comment.

app.post('/api/v1/comments/:id/report', async (req, res) => {

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

  const report = new Report(req.body);

  report.reporter = '65f9b0c3da893c266cd903b1'; // TODO: use the current user's user ID.

  // Attach the report to the comment and save it.

  comment.reports.push(report);

  await comment.save();

  console.log(comment);
  console.log(report);

  res.sendStatus(201); // TODO: return the report contents.
});

// Get a user by their ID.

app.get('/api/v1/users/:id', async (req, res) => {

  const user = await User.findById(req.params.id).select('username');

  console.log(user);

  res.send(user);
});

// Register `src/public` for remaining static routes.

app.use(express.static('src/public'));

// Start the server.
app.listen(port, () => {
  console.log('Listening on port: ' + port);
});