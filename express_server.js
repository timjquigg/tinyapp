//
// The goal of this exercise is to implement a basic web server using Express.
//

//
// Imports
//

const express = require('express');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const {
  generateRandomString,
  getUserByEmail,
  urlsForUser
} = require('./helpers');


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
    dateCreated: new Date().toLocaleString(),
    numClicks: 0,
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    dateCreated: new Date().toLocaleString(),
    numClicks: 0,
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  aJ48lX: {
    id: "aJ48lX",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};


//
// MIDDLEWARE
//
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: [generateRandomString(), generateRandomString()],
}));
app.use(morgan('dev'));


//
// AUTHENTICATION
//

// Login
app.post('/login', (req, res) => {
  const {email, password} = req.body;

  const user = getUserByEmail(users, email);
  if (user && bcrypt.compareSync(password, users[user].password)) {
    req.session.user_id = user;
    return res.redirect('/urls');
  }

  res.status(403);
  const message = 'E-mail and/or Password incorrect';
  const templateVars = {
    message,
    users,
    user: req.session.user_id,
  };

  res.render('error', templateVars);
});

// Logout
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/login');
});

//
// BROWSE
//

// Index of URLs
app.get('/urls', (req, res) => {
  const user = req.session.user_id;
  const templateVars = {
    users,
    user
  };

  // If a valid user is logged in
  if (user in users) {
    const URLs = urlsForUser(user, urlDatabase);
    templateVars['urls'] = URLs;
    return res.render('urls_index', templateVars);
  }

  const message = 'User needs to be logged in to see URLs';
  templateVars['message'] = message;
  
  res.render('error', templateVars);

});


//
// READ
//

// Home
app.get('/', (req, res) => {
  const user = req.session.user_id;
  if (user in users) {
    return res.redirect('/urls');
  }
  res.redirect('/login');
});

// Open Create new URL Page
app.get('/urls/new', (req, res) => {
  const user = req.session.user_id;
  const templateVars = {
    users,
    user,
  };

  // If a valid user is logged in
  if (user in users) {
    return res.render('urls_new', templateVars);
  }

  const message = 'User needs to be logged in to create URLs';
  templateVars['message'] = message;
  res.render('error', templateVars);
});

// Open particular URL for editing by short URL :id
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const user = req.session.user_id;
  const templateVars = {
    users,
    user,
    id
  };
  
  // If a valid user is not logged in
  if (!(user in users)) {
    const message = 'User must be logged in to see Tiny URL';
    templateVars['message'] = message;
    res.render('error', templateVars);
  }

  const userURLs = urlsForUser(user, urlDatabase);
  
  if (!(id in userURLs)) {
    const message = 'URL does not belong to user';
    templateVars['message'] = message;
    return res.render('error', templateVars);
  }
  
  templateVars['longURL'] = urlDatabase[id].longURL;
  templateVars['dateCreated'] = urlDatabase[id].dateCreated;
  templateVars['numClicks'] = urlDatabase[id].numClicks;
  return res.render('urls_show', templateVars);
  

});

// Redirect to longURL corresponding to short URL :id
app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  if (!(id in urlDatabase)) {
    const message = 'URL does not exist';
    const templateVars = {
      message,
      users,
      user: req.session.user_id,
    };
    return res.render('error', templateVars);
  }
  urlDatabase[id].numClicks ++;
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

// Open register page
app.get('/register', (req, res) => {
  const templateVars = {
    users,
    user: req.session.user_id,
  };
  
  if (req.session.user_id in users) {
    return res.redirect('/urls');
  }

  res.render('register', templateVars);
});

// Open Login page
app.get('/login' , (req, res) => {
  const templateVars = {
    users,
    user: req.session.user_id,
  };
  
  if (req.session.user_id in users) {
    return res.redirect('/urls');
  }

  res.render('login', templateVars);
});

//
// ADD
//

// Create a new short URL
app.post('/urls', (req, res) => {
  const user = req.session.user_id;
  if (user in users) {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    const created = new Date();
    const formatedDate = created.toLocaleString();
    console.log(created);
    console.log(created.toLocaleString());
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: user,
      dateCreated: formatedDate,
      numClicks: 0,
    };
    return res.redirect(`/urls/${shortURL}`);
  }
  const message = 'User must be logged in to create new tinyURLS';
  const templateVars = {
    users,
    user,
    message
  };
  res.render('error', templateVars);
});

// Register
app.post('/register', (req, res) => {
  const {email, password} = req.body;
  
  if (!email || !password) {
    res.status(400);
    const message = 'Email & Password must not be blank';
    const templateVars = {
      message,
      users,
      user: req.session.user_id
    };
    return res.render('error', templateVars);
  }

  if (getUserByEmail(users, email)) {
    res.status(400);
    const message = 'Email already exists';
    const templateVars = {
      message,
      users,
      user: req.session.user_id
    };
    return res.render('error', templateVars);
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password: hashedPassword
  };

  req.session.user_id = id;
  res.redirect('/urls');

});

//
// EDIT
//

// Edit an URL
app.post('/urls/:id', (req, res) => {
  
  const id = Object.keys(req.body);
  const longURL = req.body[id];
  const user = req.session.user_id;
  const templateVars = {
    users,
    user,
    id
  };
  
  /*
  The following check would not really be necessary in production code. If edits are only allowed by the logged in owner of an url, checking whether the url exists in the database is irrelavent. Checking the user is logged in and that the url is in the subset of urls owned by this user from the database is all that's really necessary.
  */
  if (!(id in urlDatabase)) {
    const message = 'Tiny URL does not exist';
    templateVars['message'] = message;
    return res.render('error', templateVars);
  }

  // If a valid user is not logged in:
  if (!(user in users)) {
    const message = 'User must be logged in to edit Tiny URL';
    templateVars['message'] = message;
    return res.render('error', templateVars);
  }
  
  const userURLs = urlsForUser(user, urlDatabase);
  
  // If the url is not within the subset of urls owned by this user:
  if (!(id in userURLs)) {
    const message = 'URL does not belong to user';
    templateVars['message'] = message;
    return res.render('error', templateVars);
  }
  
  urlDatabase[id].longURL = longURL;
  res.redirect('/urls');
});

//
// DELETE
//

// Delete an URL
app.post('/urls/:id/delete', (req, res) => {
  const id = req.body.id;
  const user = req.session.user_id;
  const templateVars = {
    users,
    user,
    id
  };
  
  /*
  The following check would not really be necessary in production code. If deletions are only allowed by the logged in owner of an url, checking whether the url exists in the database is irrelavent. Checking the user is logged in and that the url is in the subset of urls owned by this user from the database is all that's really necessary.
  */
  if (!(id in urlDatabase)) {
    const message = 'Tiny URL does not exist';
    templateVars['message'] = message;
    return res.render('error', templateVars);
  }
  
  // If a valid user is not logged in:
  if (!(user in users)) {
    const message = 'User must be logged in to delete Tiny URL';
    templateVars['message'] = message;
    return res.render('error', templateVars);
  }

  const userURLs = urlsForUser(user, urlDatabase);

  // If the url is not within the subset of urls owned by this user:
  if (!(id in userURLs)) {
    const message = 'URL does not belong to user';
    templateVars['message'] = message;
    return res.render('error', templateVars);
  }

  delete urlDatabase[id];
  res.redirect('/urls');
});


// Start Server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});