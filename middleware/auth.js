const { loggedIn, checkUserOwnUrl, getUserByEmail } = require("../helpers");
const { users, urlDatabase } = require("../data/database");

function checkLogIn(req, res, next) {
  req.userID = req.session.user_id || {};
  req.user = users[req.userID] || {};
  if (!loggedIn(users, req.userID)) {
    return res
      .status(403)
      .render("error", { user: req.user, error: "You need to log in first!" });
  }
  next();
}
function checkPermission(req, res, next) {
  req.userID = req.session.user_id || {};
  req.shortURL = req.params.shortURL;
  const user = users[req.userID] || {};
  if (!checkUserOwnUrl(urlDatabase[req.shortURL], req.userID)) {
    return res
      .status(403)
      .render("error", { user, error: "You do not have permission!" });
  }
  next();
}
function checkIfUrlExistInDB(req, res, next) {
  req.userID = req.session.user_id;
  req.shortURL = req.params.shortURL;
  req.user = users[req.userID] || {};
  if (urlDatabase[req.shortURL] === undefined) {
    return res.status(404).render("error", {
      user: req.user,
      error: "URL for the given ID does not exist",
    });
  }
  next();
}
function redirectIfNotLoggedIn(req, res, next) {
  if (!loggedIn(users, req.session.user_id)) {
    return res.redirect("/login");
  }
  next();
}
function redirectIfLoggedIn(req, res, next) {
  if (loggedIn(users, req.session.user_id)) {
    return res.redirect("/urls");
  }
  next();
}

function checkMissingInputs(req, res, next) {
  req.userID = req.session.user_id;
  const { email, password } = req.body;  
  req.email = email;
  req.password = password;
  req.user = users[req.userID] || {};
  if (!email || !password) {
    return res
      .status(403)
      .render("error", { user: req.user, error: "Missing ID/Password" });
  }
  next();
}

function checkUserExists(req, res, next) {
  const userObj = getUserByEmail(req.email, req.users);
  if (userObj) {
    return res
      .status(400)
      .render("error", { user: req.user, error: "Email already exists" });
  }
  next();
}

module.exports = {
  checkLogIn,
  checkPermission,
  checkIfUrlExistInDB,
  redirectIfNotLoggedIn,
  redirectIfLoggedIn,
  checkMissingInputs,
  checkUserExists
};
