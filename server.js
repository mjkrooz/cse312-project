const express = require('express')
const path = require('path')
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const {validatePassword} = require('./utils/validate_credentials')
const {sanitize_html} = require('./utils/escape_html')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('./models/user')
const Post = require('./models/post')
const {Comment, Report} = require('./models/comment')
const cookieParser = require('cookie-parser')
const appVars = require('./middleware/appVars')
const getUser = require('./middleware/getUser')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const handlebars = require('express-handlebars')
const crypto = require('crypto');

const handlebars_t = handlebars.create({
  helpers: {
    objectIdEquals: function (a, b, options) {

      if (a === null || b === null) {

        return options.inverse(this);
      }

      if (a.equals(b)) {
        return options.fn(this);
      }

      return options.inverse(this);
    }
  }
});

app.engine('handlebars', handlebars_t.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(cookieParser(), appVars, function(req, res, next) {

  mongoose.connect('mongodb://db:27017/cse312');
  res.append('X-Content-Type-Options', 'nosniff');
  next();
});

app.get('/', getUser, async (req, res) => {

  const posts = await Post.find({});

  console.log(posts);

  res.render('home/index', {
    layout: false,
    username: req.cse312.user === null ? null : req.cse312.user.username,
    user_id: req.cse312.user === null ? null : req.cse312.user._id,
    posts: (await Promise.all(posts.map(async (post) => {

      let raw = post.toJSON();
      const comments = await Comment.find({'post_id': post._id});
      const user = await User.findOne({'_id': post.user_id});


      raw.comments = await Promise.all(comments.map(async (comment) => {

        let raw = comment.toJSON();

        const user = await User.findOne({'_id': comment.user_id}).select('username');
        raw.user = user.toJSON();

        const reports = await Promise.all(comment.reports.map(async (report) => {

          let raw = report.toJSON();

          const user = await User.findOne({'_id': report.reporter}).select('username');
          raw.reporter = user.toJSON();

          return raw;
        }));

        raw.reports = reports;

        return raw;
      }));
      raw.user = user.toJSON();

      return raw;
    }))).reverse()
  })

  // if (req.cse312.user === null) {

  //   res.sendFile(__dirname + '/src/public/index_guest.html');
  // } else {

  //   res.sendFile(__dirname + '/src/public/index_authed.html');
  // }
});



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



//root endpoint
app.get('/', (req, res) => {

  res.sendFile(__dirname + '/src/public/index.html');
});

//endpoint to serve all public files
app.get('/public/:filename', (req, res) => {

  const filename = req.params.filename;
  

  const filePath = path.join(__dirname, 'src', 'public',filename);

  
  res.sendFile(filePath, (err) => {
      if (err) {
         
          console.error(err);
          return res.status(404).send('File not found');
      }
  });
});


app.get('/public/image/:filename', (req, res) => {
  const filename = req.params.filename;
  console.log(filename);
  const filePath = path.join(__dirname, 'src', 'public', 'image', filename);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(404).send('Image not found');
    }
  });
});

app.post('/register',async (req,res)=>{

    var {username,password,password_confirm} = req.body


    if(password != password_confirm)
    {
      return res.status(401).json({ error: 'Passwords do not match'});
      
    }

    if(!validatePassword(password))
    {
      return res.status(401).json({error:'Password too weak, registration failed.'})
    }
    
    userExists = await User.exists({username})

    if(userExists){
      return res.status(401).json({error:'Username taken'})

    }

    username = sanitize_html(username)

    const salt = await bcrypt.genSalt()
  
    // password = password+salt

    passwordHash = await bcrypt.hash(password,salt)
  
    //construct new user using our User mongo model
    const user = new User(
      {
        username,
        passwordHash,
        salt
      }
    )
     await user.save()
  
     return res.status(201).json({success: 'Account registered sucessfully.'})

})

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
      console.log('Login request received');
      console.log('Username:', username);
      console.log('Password:', password);

      const user = await User.findOne({ username });
      console.log('User:', user);
      if (!user) {
          console.log('Invalid username/password');
          return res.status(401).json({ error: 'Invalid username/password' });
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      console.log('Password match:', passwordMatch);
      if (!passwordMatch) {
          console.log('Invalid username/password');
          return res.status(401).json({ error: 'Invalid username/password' });
      }

      const sessionToken = crypto.randomBytes(32).toString('hex');

      const hashedToken = crypto.createHash('sha256').update(sessionToken).digest('hex');
      user.sessionToken = hashedToken;
      await user.save();

      res.cookie('sessionToken', sessionToken, { httpOnly: true, maxAge: 3600000 });
      console.log('Session token:', sessionToken);
      console.log('Login successful');
      res.sendStatus(200);
  } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/logout', getUser, async (req, res) => {

  if (req.cse312.user === null) {

    return res.redirect('/'); 
  }

  req.cse312.user.sessionToken = '';
  await req.cse312.user.save();
  res.cookie('sessionToken', '', {maxAge: -3600 * 1000});

  res.redirect('/');
})

// Register API routes. All endpoints parse the body as JSON.

const apiRoutes = require('./routes/api')
app.use('/api/v1', express.json(), apiRoutes);

// Register `src/public` for remaining static routes.

app.use(express.static('src/public'));

// Start the server.
app.listen(port, () => {
  console.log('Listening on port: ' + port);
});