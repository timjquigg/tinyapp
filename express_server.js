// The goal of this exercise is to implement a basic web server using Express.

const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const generateRandomString = () => {
  
  const randomNumbers = [];
  const string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i < 6; i++) {
    let randomChar = string[Math.floor(Math.random() * string.length)];
    randomNumbers.push(randomChar);
  }
  
  return randomNumbers.join('');
};

//
// MIDDLEWARE
//
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
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
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

// Create new URL
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  };
  res.render('urls_new', templateVars);
});

// Open particular URL by short URL :id
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
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

// Login
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
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