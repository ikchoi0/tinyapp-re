const express = require("express");
const app = express();
const PORT = 8080;

const urlDatabase = {
  "abc": "www.google.com",
  "def": "www.amazon.com"
};

app.get("/urls", (req, res) => {
  res.send("this is home");
});

app.listen(PORT, () => {
  console.log("Server listening on port:", PORT);
});