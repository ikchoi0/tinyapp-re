const { loggedIn, checkUserOwnUrl } = require('../helper/helper');
const { users, urlDatabase } = require('../data/database');
 
function auth (req, res, next) {
  req.userID = req.session.user_id || {};
  req.shortURL = req.params.shortURL;
  if (
    !loggedIn(users, req.userID) ||
    !checkUserOwnUrl(urlDatabase[req.shortURL], req.userID)
  ) {
    return res.status(403).send("You do not have permission!");
  }
  next();
}

module.exports = { auth };