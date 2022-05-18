const express = require("express");
const bodyParser = require('body-parser')
const app = express();
const PORT = 8080;

const urlDatabase = require("./data/database");
const { generateShortURL } = require("./helper/helper");
const { send } = require("express/lib/response");
app.use(bodyParser.urlencoded({'extended': true}));
app.set("view engine", "ejs");

app.get("/urls/new", (req, res) => {
  const templateVars = {};
  res.render("url_new", templateVars);
});

app.get("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL]
  };
  res.render("url_edit", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL]
  };
  res.render("url_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("url_index", templateVars);
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

app.listen(PORT, () => {
  console.log("Server listening on port:", PORT);
});

app.use((req, res) => {
  res.status(404).send(`<h1>Page Not Found: ${req.url}</h1>`);
});
