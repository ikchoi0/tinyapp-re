const express = require("express");
const bodyParser = require('body-parser')
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

const { urlDatabase, users } = require("./data/database");
const { generateShortURL } = require("./helper/helper");
const { send } = require("express/lib/response");
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
    longURL: urlDatabase[shortURL],
    user: user
  };
  res.render("url_edit", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]] || {};
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    user: user
  };
  res.render("url_show", templateVars);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]] || {};
  const templateVars = {urls: urlDatabase, user: user};
  res.render("url_index", templateVars);
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

app.post("/urls/new", (req, res) => {
  const length = 6;
  urlDatabase[generateShortURL(length)] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

function checkEmail(users, email) {
  for(let key of Object.keys(users)) {
    let userObj = users[key];
    if (userObj.email === email) {
      return userObj;
    }
    return null;
  }
}

app.post("/register", (req, res) => {
  console.log(req.body.email);
  const {email, password} = req.body;
  const userObj = checkEmail(users, email);
  if (userObj) {
    return res.status("400").send("Email already exists");
  }
  const generatedID = generateShortURL(6);
  users[generatedID] = { generatedID, email, password };
  res.cookie("user_id", generatedID);
  res.redirect('/urls');
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
