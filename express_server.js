const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const { urlDatabase, users } = require("./data/database");
const {
  generateShortURL,
  getUserByEmail,
  checkUserID,
  loggedIn,
  filteredUrlDatabase,
  checkUserOwnUrl,
} = require("./helpers");
const { auth, checkLogIn, checkPermission } = require("./middleware/auth");

const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["hellohellohello"],

    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
app.get("/", (req, res) => {
  if (!loggedIn(users, req.session.user_id)) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});
app.get("/u/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const user = users[userID] || {};
  if (urlDatabase[shortURL] === undefined) {
    return res
      .status(404)
      .render("error", { user, error: "URL for the given ID does not exist" });
  }
  res.redirect(urlDatabase[shortURL].longURL);
});
app.get("/urls/new", (req, res) => {
  if (!loggedIn(users, req.session.user_id)) {
    return res.redirect("/login");
  }
  const user = users[req.session.user_id] || {};
  const templateVars = { user };
  res.render("url_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const user = users[userID] || {};
  if (!loggedIn(users, req.session.user_id)) {
    return res.status(401).render("error", { user, error: "Not logged in" });
  }
  if (urlDatabase[shortURL] === undefined) {
    return res
      .status(404)
      .render("error", { user, error: "URL for the given ID does not exist" });
  }
  if (!checkUserOwnUrl(urlDatabase[shortURL], userID)) {
    return res.status(404).render("error", {
      user,
      error: "URL for the given ID exist but you do not own that URL",
    });
  }
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: user,
  };
  res.render("url_show", templateVars);
});
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID] || {};
  const filtered = filteredUrlDatabase(urlDatabase, userID);
  const templateVars = { urls: filtered, user: user };
  res.render("url_index", templateVars);
});
app.get("/login", (req, res) => {
  if (loggedIn(users, req.session.user_id)) {
    return res.redirect("/urls");
  }
  const user = users[req.session.user_id] || {};
  const templateVars = { user };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  if (loggedIn(users, req.session.user_id)) {
    return res.redirect("/urls");
  }
  const user = users[req.session.user_id] || {};
  const templateVars = { user };
  res.render("register", templateVars);
});
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID] || {};
  if (!loggedIn(users, userID)) {
    return res
      .status(401)
      .render("error", { user, error: "You need to log in to add URL" });
  }
  const longURL = req.body.longURL;
  const length = 6;
  const generatedID = generateShortURL(length);
  urlDatabase[generatedID] = {
    longURL: longURL,
    userID: userID,
  };
  res.redirect(`/urls/${generatedID}`);
});
app.post("/urls/:shortURL", checkLogIn, checkPermission, (req, res) => {
  urlDatabase[req.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", checkLogIn, checkPermission, (req, res) => {
  delete urlDatabase[req.shortURL];
  res.redirect(`/urls`);
});
app.post("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID] || {};
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(403).render("error", { user, error: "Missing ID/Password" });
  }
  const userObj = getUserByEmail(email, users);
  if (userObj) {
    res.status(400).render("error", { user, error: "Email already exists" });
  }

  const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  const id = generateShortURL(6);
  users[id] = {
    id,
    email,
    password: hashedPassword,
  };
  req.session.user_id = id;
  res.redirect("/urls");
});
app.post("/login", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID] || {};
  if (checkUserID(users, userID)) {
    return res.redirect("/urls");
  }
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(403).render("error", { user, error: "Missing ID/Password" });
  }
  const userObj = getUserByEmail(email, users);
  if (userObj && bcrypt.compareSync(password, userObj.password)) {
    req.session.user_id = userObj.id;
    return res.redirect("/urls");
  }
  res
    .status(403)
    .render("error", { user, error: "wrong ID/password combination" });
});
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
app.listen(PORT, () => {
  console.log("Server listening on port:", PORT);
});

app.use((req, res) => {
  res.status(404).send(`<h1>Page Not Found: ${req.url}</h1>`);
});
