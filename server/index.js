const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

let signups = []; // replace with DB later

app.post("/signup", async (req, res) => {
  const { firstName, lastName, email } = req.body;

  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress;

  let locationData = {};

  try {
    const geo = await fetch(`http://ip-api.com/json/${ip}`);
    locationData = await geo.json();
  } catch (err) {
    console.log("Geo lookup failed");
  }

  const newSignup = {
    firstName,
    lastName,
    email,
    ip,
    location: locationData,
    date: new Date(),
  };

  signups.push(newSignup);

  console.log("New Signup:", newSignup);

  res.json({ success: true });
});

app.get("/signups", (req, res) => {
  res.json(signups);
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'client/build')));

module.exports = app;