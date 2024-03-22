const express = require('express')
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const {validatePassword} = require('./utils/validate_credentials')
const bcrypt = require('bcrypt')
const User = require('./models/user')
const mongoose = require('mongoose')

mongoose.set('strictQuery',false)
mongoose.connect('mongodb://mongodb:27018/blogs').then(()=>{
  console.log('Connected to db')
})
.catch(error=>{
  console.log("Failed to connect to db")
})
app.use(function(req, res, next) {

  res.append('X-Content-Type-Options', 'nosniff');
  next();
});

app.get('/', (req, res) => {

  res.sendFile(__dirname + '/src/public/index.html');
});

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/registration-form', (req, res) => {
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
    user = await user.save()
   // user = await user.save() //save user to our collection

    res.status(302).redirect('/').json(user)

})
// Register `src/public` for remaining static routes.

app.use(express.static('src/public'));

// Start the server.
app.listen(port, () => {
  console.log('Listening on port: ' + port);
});