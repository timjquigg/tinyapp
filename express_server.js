//
// The goal of this exercise is to implement a basic web server using Express.
//


// Imports
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { Template } = require('ejs');
const {generateRandomString, getUserByEmail} = require('./helpers');

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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});

// Open Create new URL Page
app.get('/urls/new', (req, res) => {
  const templateVars = {
    users,
    user: req.cookies.user_id,
  };
  if (req.cookies.user_id in users) {
    return res.render('urls_new', templateVars);
  }
  res.redirect('/login');
});

// Create a new short URL
app.post('/urls', (req, res) => {
  if (req.cookies.user_id in users) {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = {longURL: longURL};
    return res.redirect(`/urls/${shortURL}`);
  }
  res.send('User must be logged in to create new tinyURLS');
});

// Open particular URL by short URL :id
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const templateVars = {
    users,
    user: req.cookies.user_id,
    id: id,
    longURL: urlDatabase[id].longURL
  };
  res.render('urls_show', templateVars);
});

// Redirect to longURL corresponding to short URL :id
app.get('/u/:id', (req, res) => {
  if (!(req.params.id in urlDatabase)) {
    return res.send('URL does not exist');
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// Register

app.get('/register', (req, res) => {
  const templateVars = {
    users,
    user: req.cookies.user_id,
  };
  
  if (req.cookies.user_id in users) {
    return res.redirect('/urls');
  }

  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const {email, password} = req.body;
  
  if (!email || !password) {
    res.status(400);
    return res.send('Email & Password must not be blank');
  }

  if (getUserByEmail(users, email)) {
    res.status(400);
    return res.send('Email already exists');
  }

  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password
  };

  res.cookie('user_id', id);
  res.redirect('/urls');

});


// Login
app.get('/login' , (req, res) => {
  const templateVars = {
    users,
    user: req.cookies.user_id,
  };
  
  if (req.cookies.user_id in users) {
    return res.redirect('/urls');
  }

  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const {email, password} = req.body;

  const user = getUserByEmail(users, email);
  if (user && users[user].password === password) {
    res.cookie('user_id', user);
    return res.redirect('/urls');
  }
  res.status(403);
  res.send('E-mail and/or Password incorrect');
  
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});


//
// EDIT
//

app.post('/urls/:id/edit', (req, res) => {
  const id = Object.keys(req.body);
  const longURL = req.body[id];
  urlDatabase[id].longURL = longURL;
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