function generateShortURL(length) {
  let str = "01234567890abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += str[Math.floor(Math.random() * str.length)];
  }
  return result;
}
function checkUserID(users, id) {
  return Object.keys(users).indexOf(id) > -1;
}
function getUserByEmail(email, users) {
  for (let key of Object.keys(users)) {
    let userObj = users[key];
    if (userObj.email === email) {
      return userObj;
    }
  }
  return undefined;
}
function loggedIn(users, userID) {
  return userID && checkUserID(users, userID);
}
function filteredUrlDatabase(urlDatabase, userID) {
  const filtered = {};
  for (let key of Object.keys(urlDatabase)) {
    if (urlDatabase[key].userID === userID) {
      filtered[key] = urlDatabase[key];
    }
  }
  return filtered;
}

function checkUserOwnUrl(urlObj, userID) {
  if (urlObj.userID === userID) {
    return true;
  }
  return false;
}

module.exports = {
  generateShortURL,
  getUserByEmail,
  checkUserID,
  loggedIn,
  filteredUrlDatabase,
  checkUserOwnUrl,
};
