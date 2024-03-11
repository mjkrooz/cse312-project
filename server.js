const express = require('express')
const app = express();
const port = 8080;

// Set the `X-Content-Type-Options: nosniff` on all requests. Must come first in this file.

app.use(function(req, res, next){

  res.append('X-Content-Type-Options', 'nosniff');
  next();
});

// Register `GET /` for the index.

app.get('/', (req, res) => {

  res.sendFile(__dirname + '/src/public/index.html');
});

app.post('/register',(req,res)=>{
  console.log(req)
})
// Register `src/public` for remaining static routes.

app.use(express.static('src/public'));

// Start the server.
app.use()
app.listen(port, () => {
  console.log('Listening on port: ' + port);
});