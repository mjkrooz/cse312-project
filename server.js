const express = require('express')
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const {validatePassword} = require('./util/validate_credentials')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('./models/user')
const cookieParser = require('cookie-parser')
const appVars = require('./middleware/appVars')

app.use(cookieParser(), appVars, function(req, res, next) {

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

// Register API routes.

const apiRoutes = require('./routes/api')
app.use('/api/v1', apiRoutes);

// Register `src/public` for remaining static routes.

app.use(express.static('src/public'));

// Start the server.
app.listen(port, () => {
  console.log('Listening on port: ' + port);
});