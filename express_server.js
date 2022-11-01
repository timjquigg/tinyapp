// The goal of this exercise is to implement a basic web server using Express.

const express = require('express');
const app = express();
const PORT = 8080; // default port 8080;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http:// www.google.com'
};

const generateRandomString = () => {
  const charCodes = [48, 121]; // Char codes for 0 - 9, A - Z, a - z
  const randomNumbers = [];
  
  while (randomNumbers.length < 6) {
    
    let randomCode = (Math.floor(Math.random() * (charCodes[1] - charCodes[0] + 1)) + charCodes[0]);
    
    let randomChar = String.fromCharCode(randomCode);
    
    if (randomChar.match(/[A-Za-z0-9]/)) {
      randomNumbers.push(randomChar);
    }
  }
  return randomNumbers.join('');
};

// Routes
app.get('/', (req, res) => {
  res.send('Hello');
});

app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  urlDatabase[generateRandomString()] = req.body.longURL;
  res.send('ok');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});