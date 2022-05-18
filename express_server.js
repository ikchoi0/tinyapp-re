const express = require("express");
const bodyParser = require('body-parser')
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

const { urlDatabase, users } = require("./data/database");
const { generateShortURL, checkEmail, checkUserID, loggedIn } = require("./helper/helper");
const { send } = require("express/lib/response");
const res = require("express/lib/response");
app.use(bodyParser.urlencoded({'extended': true}));
app.use(cookieParser());
app.set("view engine", "ejs");

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]] || {};
  const templateVars = {user};
  res.render("url_new", templateVars);
});

app.get("/urls/:shortURL/edit", (req, res) => {
  const user = users[req.cookies["user_id"]] || {};
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: user
  };
  res.render("url_edit", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]] || {};
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: user
  };
  res.render("url_show", templateVars);
});

function filteredUrlDatabase (urlDatabase, userID) {
  const filtered = {};
  for (let key of Object.keys(urlDatabase)) {
    if (urlDatabase[key].userID === userID) {
      filtered[key] = urlDatabase[key];
    }
  }
  return filtered;
}

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID] || {};
  const filtered = filteredUrlDatabase(urlDatabase, userID);
  const templateVars = {urls: filtered, user: user};
  res.render("url_index", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL] === undefined) {
    return res.send("Error: shortURL does not exist");
  };
  res.redirect(urlDatabase[shortURL].longURL);
});
app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]] || {};
  const templateVars = {user};
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]] || {};
  const templateVars = {user};
  res.render("register", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!loggedIn(users, userID)){
    return res.redirect("/login");
  }
  const longURL = req.body.longURL;
  const length = 6;
  const generatedID = generateShortURL(length);
  urlDatabase[generatedID] = {
    longURL: longURL,
    userID: generatedID,
  };
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).send("Missing email/password");
  }
  const userObj = checkEmail(users, email);
  if (userObj) {
    return res.status(400).send("Email already exists");
  }
  const id = generateShortURL(6);
  users[id] = { id, email, password };
  res.cookie("user_id", id);
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  if (checkUserID(users, userId)) {
    return res.redirect("/urls");
  }
  const { email, password } = req.body; 
  const userObj = checkEmail(users, email);
  if (userObj && userObj.password === password) {
    res.cookie("user_id", userObj.id);
    return res.redirect("/urls");
  }
  res.status(403).send("wrong ID/password combination");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
app.listen(PORT, () => {
  console.log("Server listening on port:", PORT);
});

app.use((req, res) => {
  res.status(404).send(`<h1>Page Not Found: ${req.url}</h1>`);
});
