function generateShortURL(length) {
  let str = "01234567890abcdefghijklmnopqrstuvwxyz"
  let result = "";
  for(let i = 0; i < length; i++) {
    result += str[Math.floor(Math.random() * str.length)];
  }
  return result;
}
function checkUserID(users, id) {
  return Object.keys(users).indexOf(id) > -1;
}
function checkEmail(users, email) {
  for(let key of Object.keys(users)) {
    let userObj = users[key];
    if (userObj.email === email) {
      return userObj;
    }
  }
  return null;
}
module.exports = {generateShortURL, checkEmail, checkUserID};