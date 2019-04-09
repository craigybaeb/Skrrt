var express = require('express');
var app = express();
const MongoClient = require('mongodb').MongoClient; //npm install mongodb@2.2.32
const url = "mongodb://localhost:27017/profiles";
const session = require('express-session'); //npm install express-session
const bodyParser = require('body-parser'); //npm install body-parser
var currentUser = "";
// //this tells express we are using sesssions. These are variables that only belong to one user of the site at a time.
app.use(session({ secret: 'example' }));

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

var db;


//this is our connection to the mongo db, ts sets the variable db as our database
MongoClient.connect(url, function(err, database) {
  if (err) throw err;
  db = database;
  app.listen(8080);
  console.log('listening on 8080');
});


app.get('/', function(req, res) {
 res.render('pages/index');
});

// app.get('/login', function(req, res) {
//  res.render('partials/login');
// });

app.get('/main', function(req, res) {
 res.render('pages/main');
 console.log(req.body.Start)
});

app.post('/main', function(req, res){
  console.log(req.body.Start);
  console.log(req.body.End);
  console.log(req.body.distance);
  console.log(req.body.fuelPrice);
  console.log(req.body.carDetails);
  console.log(req.body.passengers);

  res.render('pages/main', {Start:req.body.Start, End:req.body.End, Distance:req.body.distance, fuelPrice:req.body.fuelPrice, carDetails:req.body.carDetails, Passengers:req.body.passengers})

  res.json({ ok: true });
});

app.get('/register', function(req, res) {
 res.render('pages/register');
});

app.get('/profile', function(req, res) {
  db.collection('profiles').findOne({"login.username":currentUser}, function(err, result) {
    if (err) throw err;//if there is an error, throw the error
    console.log(result.fname);
    first=result.fname;
    res.render('pages/profile', {First:result.fname, Last:result.surname, Username:result.login.username});
  });
});

app.get('/journey', function(req, res) {
 res.render('pages/journey');
});

app.get('/garage', function(req, res) {
  db.collection('profiles').findOne({"login.username":currentUser}, function(err, result) {
    if (err) throw err;//if there is an error, throw the error
    res.render('pages/garage', {make:result.car.make, model:result.car.model});
  });
});

app.get('/adduser', function(req, res) {
 res.render('pages/main');
});


app.post('/adduser', function(req, res) {
  //check we are logged in
//  if(!req.session.loggedin){res.redirect('/login');return;}

  //we create the data string from the form components that have been passed in

var datatostore = {
"fname":req.body.fname,
"surname":req.body.surname,
"email":req.body.email,
"login":{"username":req.body.username,"pword":req.body.password},
"car":{"make":req.body.make,"model":req.body.model,"year":req.body.year}
}


//once created we just run the data string against the database and all our new data will be saved/
  db.collection('profiles').save(datatostore, function(err, result) {
    if (err) throw err;
    console.log('saved to database')
    //when complete redirect to the index
    currentUser=datatostore.login.username;
    res.redirect('/profile')
  })
});

//the dologin route detasl with the data from the login screen.
//the post variables, username and password ceom from the form on the login page.
app.post('/dologin', function(req, res) {
  console.log(JSON.stringify(req.body))
  var uname = req.body.uname;
  var pword = req.body.pword;

  db.collection('profiles').findOne({"login.username":uname}, function(err, result) {
    if (err) throw err;//if there is an error, throw the error
    //if there is no result, redirect the user back to the login system as that username must not exist
    if(!result){res.redirect('/login');return}
    //if there is a result then check the password, if the password is correct set session loggedin to true and send the user to the index
    if(result.login.pword == pword){console.log("CORRECT"); req.session.loggedin = true; currentUser=result.login.username; res.redirect('/profile') }
    //otherwise send them back to login
    else{console.log("INCORRECT"); }
  });
});

//logour route cause the page to Logout.
//it sets our session.loggedin to false and then redirects the user to the login
app.get('/logout', function(req, res) {
  req.session.loggedin = false;
  req.session.destroy();
  currentUser="";
  res.redirect('/main');
});

app.use(function (req, res, next) {
  res.status(404).render('pages/404');
})
