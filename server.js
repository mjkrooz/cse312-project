const express = require('express')
const path = require('path')
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const {validatePassword} = require('./utils/validate_credentials')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('./models/user')
const cookieParser = require('cookie-parser')
const appVars = require('./middleware/appVars')
const jwt = require('jsonwebtoken')
require('dotenv').config()

app.use(cookieParser(), appVars, function(req, res, next) {

  mongoose.connect('mongodb://db:27017/cse312');
  res.append('X-Content-Type-Options', 'nosniff');
  next();
});

app.get('/', (req, res) => {

  res.sendFile(__dirname + '/src/public/index.html');
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
  const filePath = path.join(__dirname, 'src', 'public', filename);

  // Send the file to the client
  res.sendFile(filePath, (err) => {
      if (err) {
          // If an error occurs, log it and send a 404 response
          console.error(err);
          res.status(404).send('File not found');
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

app.post('/login', async (request, response) => {
  try {
    console.log('Login request received');
    
    const { username, password } = request.body;
    console.log('Username:', username);
    console.log('Password:', password);

    const user = await User.findOne({username});
    console.log('User:', user);

    const passwordMatch = user === null
      ? false
      : await bcrypt.compare(password, user.passwordHash);

    console.log('Password match:', passwordMatch);

    if (!user || !passwordMatch) {
      console.log('Invalid username/password');
      return response.status(401).json({ error: 'Invalid username/password' });
    }

    const personToken = {
      username: user.username,
      id: user._id
    };

    const token = jwt.sign(personToken, process.env.SECRET, { expiresIn: 3600 });
    console.log('Token generated:', token);

    response.status(201).send({ token, username: user.username, name: user.name });
  } catch (error) {
    console.error('Login Error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});





// Register API routes. All endpoints parse the body as JSON.

const apiRoutes = require('./routes/api')
app.use('/api/v1', express.json(), apiRoutes);

// Register `src/public` for remaining static routes.

app.use(express.static('src/public'));

// Start the server.
app.listen(port, () => {
  console.log('Listening on port: ' + port);
});