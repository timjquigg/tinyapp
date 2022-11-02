//
// The goal of this exercise is to implement a basic web server using Express.
//


// Imports
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { Template } = require('ejs');
const {generateRandomString} = require('./generate_Random');

//
// INITIALIZATION
//

const app = express();
const PORT = 8080; // default port 8080;

app.set('view engine', 'ejs');


//
// DATA STORES
//
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//
// MIDDLEWARE
//
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

//
// ROUTES
//

// Home
app.get('/', (req, res) => {
  res.send('Hello');
});


// Index of URLs
app.get('/urls', (req, res) => {
  const templateVars = {
    users,
    user: req.cookies.user_id,
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

// Create new URL
app.get('/urls/new', (req, res) => {
  const templateVars = {
    users,
    user: req.cookies.user_id,
  };
  res.render('urls_new', templateVars);
});

// Open particular URL by short URL :id
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    users,
    user: req.cookies.user_id,
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render('urls_show', templateVars);
});

// Redirect to longURL corresponding to short URL :id
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Register

app.get('/register', (req, res) => {
  const templateVars = {
    users,
    user: req.cookies.user_id,
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const {email, password} = req.body;
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password
  };

  console.log(users);
  res.cookie('user_id', id);
  res.redirect('/urls');

});


// Login
app.post('/login', (req, res) => {
  const username = req.body.username;
  // res.cookie('username', username);
  res.redirect('/urls');
});

// Logout
app.post('/logout', (req, res) => {
  // res.clearCookie('username');
  res.redirect('/urls');
});

//
// CREATE
//

// Create a new short URL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//
// EDIT
//

app.post('/urls/:id/edit', (req, res) => {
  Object.assign(urlDatabase, req.body);
  res.redirect('/urls');
});

//
// DELETE
//

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.body.id];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});