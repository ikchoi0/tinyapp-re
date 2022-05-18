function generateShortURL(length) {
  let str = "01234567890abcdefghijklmnopqrstuvwxyz"
  let result = "";
  for(let i = 0; i < length; i++) {
    result += str[Math.floor(Math.random() * str.length)];
  }
  return result;
}

module.exports = {generateShortURL};