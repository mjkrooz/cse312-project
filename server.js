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
const {Comment} = require('./models/comment')
const cookieParser = require('cookie-parser')
const appVars = require('./middleware/appVars')
const {getUser} = require('./middleware/getUser')
require('dotenv').config()
const handlebars = require('express-handlebars')
const crypto = require('crypto');
const {validateCSRF, generateCSRF} = require('./middleware/csrf');
const authenticate = require('./middleware/authenticate');
const establishSocketConnection = require('./routes/socket')
const http = require('http');
const server = http.createServer(app);
const io = establishSocketConnection(server);



/**
 * Set up the Handlebars templating engine.
 */

const handlebars_t = handlebars.create({
  helpers: {

    // A helper function to compare two ObjectIds within a template.

    objectIdEquals: function (a, b, options) {

      // Skip if either are null.

      if (a === null || b === null) {

        return options.inverse(this);
      }

      // Check equality.

      if (a.equals(b)) {
        return options.fn(this);
      }

      return options.inverse(this);
    }
  }
});

// Register the engine.

app.engine('handlebars', handlebars_t.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

/**
 * Set up default middleware, which applies to all routes.
 * 
 * This including connecting to the database as well as setting the
 * X-Content-Type-Options header to "nosniff".
 */


app.use(cookieParser(), appVars, function(req, res, next) {

  mongoose.connect('mongodb://db:27017/cse312');
  res.append('X-Content-Type-Options', 'nosniff');
  next();
});

/**
 * GET /
 * 
 * The home page.
 * 
 * Uses the "getUser" middleware to set `req.cse312.user` to either a User object if
 * the user is authenticated, or to `null` if the user is not authenticated (AKA a guest).
 */
app.get('/', getUser, generateCSRF, async (req, res) => {

  // Get all posts to display on the home page.

  const posts = await Post.find({});

  // Render the "home/index" template.

  res.render('home/index', {
    layout: false, // Prevent using a default layout, which causes an error.
    username: req.cse312.user === null ? null : req.cse312.user.username, // Set the username to nothing if a guest, or the username of the user.
    user_id: req.cse312.user === null ? null : req.cse312.user._id, // Set the user ID to nothing if a guest, or the ID of the user.
    csrf: req.cse312.user === null ? '' : req.cse312.user.csrfToken, // Set the CSRF token to that of the user's CSRF token, to be later validated.

    // A sadly-complex JSON object to represent all posts, as well as the relevant comment, user, and report data for each.
    // This has to be in JSON due to Handlebars restrictions.

    posts: (await Promise.all(posts.map(async (post) => {

      // The following runs for each individual post.

      // Convert this post to JSON.

      let raw = post.toJSON();

      // Obtain all comments for this post, as well as the data of the user who made the post.

      const comments = await Comment.find({'post_id': post._id});
      const user = await User.findOne({'_id': post.user_id});

      // Convert the comments to JSON, which requires another nested mapping to convert reports and user data.

      raw.comments = await Promise.all(comments.map(async (comment) => { // The following runs for each comment on this post.

        // Convert this comment to JSON.

        let raw = comment.toJSON();

        // Obtain the data of the user who made the comment. Only need the username. Convert the user to JSON.

        const user = await User.findOne({'_id': comment.user_id}).select('username');
        raw.user = user.toJSON();

        // Convert the reports on the comment to JSON, which requires another nested mapping to convert user data.

        const reports = await Promise.all(comment.reports.map(async (report) => { // The following runs for each report on this comment.

          // Convert this report to JSON.

          let raw = report.toJSON();

          // Get the data of the user who made the report and convert it to JSON.

          const user = await User.findOne({'_id': report.reporter}).select('username');
          raw.reporter = user.toJSON();

          // Return the now-JSON-ified report.

          return raw;
        }));

        // Apply the reports to the comment and return the JSON-ified comment.

        raw.reports = reports;

        return raw;
      }));

      // Apply the user to the post and return the finalized, JSON-ified post.

      raw.user = user.toJSON();

      return raw;
    }))).reverse() // Reverse the list of posts so the most recent appears first.
  })
});

// The remaining routes accept JSON as the request body format.

app.use(bodyParser.json());

/**
 * POST /register
 * 
 * Register an account. Note that viewing the form to register an account is covered later as a static route.
 */
app.post('/register',async (req,res)=>{

  // Get the submitted data from the request body.

  var {username,password,password_confirm} = req.body

  // Ensure that the passwords match.

  if(password != password_confirm)
  {
    return res.status(401).json({ error: 'Passwords do not match'});
    
  }

  // Ensure that the password is strong enough, using the same requirements from the homework.

  if(!validatePassword(password))
  {
    return res.status(401).json({error:'Password too weak, registration failed.'})
  }
  
  const userExists = await User.exists({username})

  // Prevent registering with the same username as another user.

  if(userExists){
    return res.status(401).json({error:'Username taken'})

  }

  // Sanitize the username.

  username = sanitize_html(username)

  // Create a hash of the password.
  // password = password+salt

  const salt = await bcrypt.genSalt()
  const passwordHash = await bcrypt.hash(password,salt)

  // Construct new user using our User mongo model

  const user = new User(
    {
      username,
      passwordHash,
      salt
    }
  )

  // Save the user and notify them that their account was created.

  await user.save()

  return res.status(201).json({success: 'Account registered sucessfully.'})
})

/**
 * POST /login
 * 
 * Logs a user in, including setting the `sessionToken` cookie.
 */
app.post('/login', async (req, res) => {

  // Get the username and password from the submitted form, noting that it will appear as JSON.

  const { username, password } = req.body;

  try {

    // If no user was found with the given username, login failed.

    const user = await User.findOne({ username });
    
    if (!user) {
      
      return res.status(401).json({ error: 'Invalid username/password' });
    }

    // Otherwise, attempt to compare the password with the stored hash of the password.

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      
      return res.status(401).json({ error: 'Invalid username/password' });
    }

    // Passwords matched, generate a session token and a hashed version of the token.

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(sessionToken).digest('hex');

    // Apply the hashed token to the user in the database and save it.

    user.sessionToken = hashedToken;
    await user.save();

    // Apply the non-hashed token as a cookie that expires in 1 hour and is HttpOnly.

    res.cookie('sessionToken', sessionToken, { httpOnly: true, maxAge: 3600000 });
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /logout
 * 
 * Logs a user out.
 */
app.get('/logout', getUser, async (req, res) => {

  // Ensure the user is not a guest first.

  if (req.cse312.user !== null) {

    // Empty the user's token in the database and save it.

    req.cse312.user.sessionToken = '';
    await req.cse312.user.save();

    // Revoke the cookie by setting it to nothing and setting its expiration in the past.

    res.cookie('sessionToken', '', {maxAge: -3600 * 1000});
  }

  res.redirect('/');
})

/**
 * GET /postpage.html
 * 
 * A form for creating a new post. Requires the user to be logged in.
 */
app.get('/postpage.html', authenticate, generateCSRF, async (req, res) => {

  // Render the "posts/postpage" template.

  res.render('posts/postpage', {
    layout: false, // Prevent using a default layout, which causes an error.
    csrf: req.cse312.user === null ? '' : req.cse312.user.csrfToken, // Set the CSRF token to that of the user's CSRF token, to be later validated.
  })
});

/**
 * Register API routes. All endpoints parse the body as JSON.
 */
const {apiRoutes} = require('./routes/api')
app.use('/api/v1', express.json(), apiRoutes);

/**
 * Register `src/public` for remaining static routes.
 * This includes forms for logging in, registering, and creating a post, as well as images,
 * CSS, and JavaScript.
 */
app.use(express.static('src/public'));


/**
 * Start the server.
 */
server.listen(port, () => {
  console.log('Listening on port: ' + port);
});