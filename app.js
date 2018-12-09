const express = require('express');
const app = express();
const mysql = require('mysql');
var session    = require('express-session');
const bodyParser = require('body-parser')
const todoController = require('./controllers/todoController');
const myDatabase = require('./db');
const edit = require('./controllers/edit');
const jsonfile = require('jsonfile');
const file = './controllers/info.json'



app.use(session({secret: "Shh, its a secret!"}))

//For BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



//load passport strategies

// setting tamplating engine
app.set('view engine', 'ejs');

// static file management
app.use(express.static('./public'));

// linking controller files
todoController(app, myDatabase(mysql));

// listeing to file
app.listen(3000);
console.log('You are listening to port 3000');
