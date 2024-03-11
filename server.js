const express = require('express')
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const {validatePassword} = require('./util/validate_credentials')
const bcrypt = require('bcrypt')
// Set the `X-Content-Type-Options: nosniff` on all requests. Must come first in this file.


// Register `GET /` for the index.

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

app.post('/register',(req,res)=>{

  const body = req.body

  username = body.username
  password = body.password



  if(validatePassword(password))
  {
    bcrypt

  }

  else{
    res.send('Password weak')
  }



  

})
// Register `src/public` for remaining static routes.

app.use(express.static('src/public'));

// Start the server.
app.listen(port, () => {
  console.log('Listening on port: ' + port);
});