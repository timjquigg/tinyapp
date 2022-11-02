const generateRandomString = () => {
  
  const randomNumbers = [];
  const string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i < 6; i++) {
    let randomChar = string[Math.floor(Math.random() * string.length)];
    randomNumbers.push(randomChar);
  }
  
  return randomNumbers.join('');
};

module.exports = { generateRandomString };