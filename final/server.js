var express = require('express');
var app = express();
app.use(express.static('final/public'));
app.get('/', function(req, res){
  res.sendFile('index.html', {root: __dirname });
});
app.get('/main', function(req, res){
  res.sendFile('main.html', {root: __dirname });
});

app.listen(8080);
