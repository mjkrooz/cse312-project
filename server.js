const express = require('express')
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const {validatePassword} = require('./util/validate_credentials')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('./models/user')
const Post = require('./models/post')
const Comment = require('./models/comment')

app.use(function(req, res, next) {

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

// Get all blog posts.

app.get('/api/v1/posts', async (req, res) => {

  mongoose.connect('mongodb://db:27017/cse312');

  const posts = await Post.find({});

  return res.send(posts);
});

// Create a new blog post.

app.post('/api/v1/posts', async (req, res) => {

  console.log(req.body);
});

// Get all comments on a particuar blog post.

app.get('/api/v1/posts/:id/comments', async (req, res) => {

  mongoose.connect('mongodb://db:27017/cse312');
  
  const comments = await Comment.find({"post_id": req.params.id, "deleted": false});

  res.send(comments);
});

// Create a comment on a particular blog post.

app.post('/api/v1/posts/:id/comments', async (req, res) => {

  mongoose.connect('mongodb://db:27017/cse312');

  console.log(req.body);


});

// Get a specific comment from its ID.

app.get('/api/v1/comments/:id', async (req, res) => {

  mongoose.connect('mongodb://db:27017/cse312');

  const comment = await Comment.findById(req.params.id);

  console.log(comment);

  res.send(comment);
})

// Report a comment.

app.post('/api/v1/comments/:id/report', async (req, res) => {

  mongoose.connect('mongodb://db:27017/cse312');

  const comment = Comment.findById(req.params.id);

  console.log(req.body);

  //comment.reports.append()

});

// Get a user by their ID.

app.get('/api/v1/users/:id', async (req, res) => {

  mongoose.connect('mongodb://db:27017/cse312');

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