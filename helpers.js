const generateRandomString = () => {
  
  const randomNumbers = [];
  const string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i < 6; i++) {
    let randomChar = string[Math.floor(Math.random() * string.length)];
    randomNumbers.push(randomChar);
  }
  
  return randomNumbers.join('');
};

const getUserByEmail = (users, email) => {
  
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  
  return false;
};

const urlsForUser = (id, URLs) => {
  const userURLs = {};

  for (const URL in URLs) {
    if (URLs[URL].userID === id) {
      userURLs[URL] = URLs[URL];
    }
  }
  return userURLs;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };