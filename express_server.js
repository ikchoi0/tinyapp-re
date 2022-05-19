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
  checkValidURL,
} = require("./helpers");
const {
  checkLogIn,
  checkPermission,
  checkIfUrlExistInDB,
  redirectIfNotLoggedIn,
  redirectIfLoggedIn,
  checkMissingInputs,
  checkUserExists,
} = require("./middleware/auth");

const PORT = 8080;
const ID_LENGTH = 6;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["hellohellohello"],

    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.get("/", redirectIfNotLoggedIn, redirectIfLoggedIn, (req, res) => {});
app.get("/u/:shortURL", checkIfUrlExistInDB, (req, res) => {
  let longURL = urlDatabase[req.shortURL].longURL;
  const { error } = checkValidURL(longURL);
  if (error) {
    return res.status(404).render("error", { user: req.user, error: error });
  }
  res.redirect(longURL);
});

app.get("/urls/new", redirectIfNotLoggedIn, (req, res) => {
  const user = users[req.session.user_id] || {};
  const templateVars = { user };
  res.render("url_new", templateVars);
});

app.get(
  "/urls/:shortURL",
  checkLogIn,
  checkIfUrlExistInDB,
  checkPermission,
  (req, res) => {
    res.render("url_show", {
      shortURL: req.shortURL,
      longURL: urlDatabase[req.shortURL].longURL,
      user: req.user,
    });
  }
);

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID] || {};
  const filtered = filteredUrlDatabase(urlDatabase, userID);
  res.render("url_index", { urls: filtered, user: user });
});

app.get("/login", redirectIfLoggedIn, (req, res) => {
  const user = users[req.session.user_id] || {};
  const templateVars = { user };
  res.render("login", templateVars);
});

app.get("/register", redirectIfLoggedIn, (req, res) => {
  const user = users[req.session.user_id] || {};
  const templateVars = { user };
  res.render("register", templateVars);
});

app.post("/urls", checkLogIn, (req, res) => {
  const longURL = req.body.longURL;
  const generatedID = generateShortURL(ID_LENGTH);
  urlDatabase[generatedID] = {
    longURL: longURL,
    userID: req.userID,
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

app.post(
  "/register",
  redirectIfLoggedIn,
  checkMissingInputs,
  checkUserExists,
  (req, res) => {
    const hashedPassword = bcrypt.hashSync(
      req.password,
      bcrypt.genSaltSync(10)
    );
    const id = generateShortURL(ID_LENGTH);
    users[id] = {
      id,
      email: req.email,
      password: hashedPassword,
    };
    req.session.user_id = id;
    res.redirect("/urls");
  }
);

app.post("/login", redirectIfLoggedIn, checkMissingInputs, (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID] || {};
  const userObj = getUserByEmail(email, users);
  if (!userObj || !bcrypt.compareSync(password, userObj.password)) {
    return res
      .status(403)
      .render("error", { user, error: "wrong ID/password combination" });
  }
  req.session.user_id = userObj.id;
  res.redirect("/urls");
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
