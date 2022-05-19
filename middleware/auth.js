const { loggedIn, checkUserOwnUrl } = require("../helpers");
const { users, urlDatabase } = require("../data/database");

function auth(req, res, next) {
  req.userID = req.session.user_id || {};
  req.shortURL = req.params.shortURL;
  const user = users[req.userID] || {};
  if (!loggedIn(users, req.userID)) {
    return res.status(403).render('error', {user, error: "You need to log in first!"});
  }
  if (!checkUserOwnUrl(urlDatabase[req.shortURL], req.userID)) {
    return res.status(403).render('error', {user, error: "You do not have permission!"});
  }
  next();
}

module.exports = { auth };
