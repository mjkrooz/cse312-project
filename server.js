const express = require('express')
const app = express();
const port = 8080;

app.use(function(req, res, next) {

  res.append('X-Content-Type-Options', 'nosniff');
  next();
});

app.use(express.static('src/public'));

app.get('/', (req, res) => {

  res.sendFile(__dirname + '/src/public/index.html');

  res.end();
});

app.listen(port, () => {
  console.log('Listening on port: ' + port);
});