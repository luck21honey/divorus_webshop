const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const app = express();
var session = require('express-session');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var passport = require('passport');
var flash = require('connect-flash');
const fs = require('fs');
var uuid = require('uuid')
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });



const LocalStrategy = require('passport-local').Strategy;
const FileStore = require('session-file-store')(session);


global.secret_key = "sk_live_zxje7A5f8jMkF8SKyd2eJAm800dzgejGx7";
global.publish_key = "sk_live_zxje7A5f8jMkF8SKyd2eJAm800dzgejGx7";


const stripe = require('stripe')('sk_test_V5yDfDEdkeogohnv5LoSkRlf009FAgIwqy');


require('./config/passport')(passport);

const {getHomePage } = require('./routes/index');
const { getEmpresaProfile,  deletePlayer} = require('./routes/player');
const port = 3000;

// create connection to database
// the mysql.createConnection function takes in a configuration object which contains host, user, password and the database name.
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'divorius'
});

// connect to database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;




// configure middleware
app.set('port', process.env.port || port); // set express to use this port
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder
app.use(fileUpload()); // configure fileupload
app.use(morgan('dev'));
app.use(cookieParser());

// routes for the app



// configure passport.js to use the local strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  (email, password, done) => {
    console.log('Inside local strategy callback')
    // here is where you make a call to the database
    // to find the user based on their username or email address
    // for now, we'll just pretend we found that it was users[0]
    const user = users[0] 
    if(email === user.email && password === user.password) {
      console.log('Local strategy returned true')
      return done(null, user)
    }
  }
));

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
  console.log('Inside serializeUser callback. User id is save to the session file store here')
  done(null, user.id);
});

// add & configure middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
   
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
   
require('./app/routes.js')(app, passport, fs, stripe);   
 


// set the app to listen on the port
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
