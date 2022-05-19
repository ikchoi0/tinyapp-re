const { users, urlDatabase } = require("./data/database");
/**
 * generates a random alphanumerical string that is 'length' long
 * @param {number} length the string length to generate
 * @return {string} returns random string
 */
function generateShortURL(length) {
  let str = "01234567890abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += str[Math.floor(Math.random() * str.length)];
  }
  return result;
}
/**
 * checks if user is registered in users database
 * @param {object} users users database object
 * @param {string} id user id to find
 * @return {boolean} returns true if user is
 * registeredalready
 */
function checkUserID(users, id) {
  return Object.keys(users).indexOf(id) > -1;
}
/**
 * finds the user who has the input email
 * @param {string} email user email
 * @param {object} users users database object
 * @return {object} returns the user object with
 * the input email
 */
function getUserByEmail(email, users) {
  for (let key of Object.keys(users)) {
    let userObj = users[key];
    if (userObj.email === email) {
      return userObj;
    }
  }
  return undefined;
}
/**
 * check if user is logged in
 * @param {object} users users database object
 * @param {string} userID user id
 * @return {boolean} returns true if user is logged in
 * and is registered in database
 */
function loggedIn(users, userID) {
  return userID && checkUserID(users, userID);
}
/**
 * filters only the url objects that is owned by userID
 * @param {object} urlDatabase urls database object
 * @param {string} userID user id
 * @return {object} returns the url objects owned by
 * userID
 */
function filteredUrlDatabase(urlDatabase, userID) {
  const filtered = {};
  for (let key of Object.keys(urlDatabase)) {
    if (checkUserOwnUrl(urlDatabase[key], userID)) {
      filtered[key] = urlDatabase[key];
    }
  }
  return filtered;
}
/**
 * checks if the url object is owned by userID
 * @param {object} urlObj url object
 * @param {string} userID user id
 * @return {boolean} returns true if url is owned by
 * userID
 */
function checkUserOwnUrl(urlObj, userID) {
  if (urlObj.userID === userID) {
    return true;
  }
  return false;
}
/**
 * checks if url is in valid format
 * @param {string} str url string
 * @return {bolean} returns true if url is in good
 * format
 */
function validURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}
/**
 * uses validURL and adds error message if url is not 
 * valid
 * @param {string} str url string
 * @return {object} returns object with error message
 */
function checkValidURL(str) {
  if (!validURL(str)) {
    return {
      error: "longURL is not in valid format. Please edit your longURL",
      data: null,
    };
  }
  return { error: null, data: null };
}

module.exports = {
  generateShortURL,
  getUserByEmail,
  checkUserID,
  loggedIn,
  filteredUrlDatabase,
  checkUserOwnUrl,
  checkValidURL,
};
