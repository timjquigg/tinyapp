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
      console.log('e-mail exists!');
      return true;
    }
  }
  
  return false;
};

module.exports = { generateRandomString, getUserByEmail };