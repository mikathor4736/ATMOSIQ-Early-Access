const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs").promises;
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Email configuration (you'll need to set these environment variables)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post("/signup", async (req, res) => {
  const { firstName, lastName, email } = req.body;

  // Validation
  const nameRegex = /^[A-Za-z]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!nameRegex.test(firstName) || !nameRegex.test(lastName) || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  let locationData = {};
  try {
    const geo = await fetch(`http://ip-api.com/json/${ip}`);
    locationData = await geo.json();
  } catch (err) {
    console.log("Geo lookup failed");
  }

  const crypto = require("crypto");
  const id = crypto.randomUUID();

  const newSignup = {
    id,
    firstName,
    lastName,
    email,
    ip,
    location: locationData,
    date: new Date().toISOString(),
  };

  // Save to file
  const storagePath = path.join(__dirname, "submissions.json");
  try {
    let submissions = [];
    try {
      const content = await fs.readFile(storagePath, "utf8");
      submissions = JSON.parse(content || "[]");
    } catch (err) {
      // File doesn't exist or is empty, start with empty array
    }

    submissions.push(newSignup);
    await fs.writeFile(storagePath, JSON.stringify(submissions, null, 2));
  } catch (err) {
    console.log("Failed to save submission:", err);
    return res.status(500).json({ error: "Unable to save your information." });
  }

  // Send welcome email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to ATMOSIQ Early Access!",
      html: `
        <h1>Welcome to ATMOSIQ!</h1>
        <p>Thank you for signing up for early access to ATMOSIQ, the AI Weather Intelligence platform.</p>
        <p>We'll keep you updated on our progress and let you know when we're ready to launch.</p>
        <p>Best regards,<br>The ATMOSIQ Team</p>
      `,
    });
  } catch (err) {
    console.log("Email sending failed:", err);
    // Don't fail the signup if email fails
  }

  console.log("New Signup:", newSignup);
  res.json({ success: true });
});

app.get("/submissions", async (req, res) => {
  const storagePath = path.join(__dirname, "submissions.json");

  try {
    const content = await fs.readFile(storagePath, "utf8");
    const submissions = JSON.parse(content || "[]");
    res.json(submissions);
  } catch (err) {
    console.log("Failed to read submissions:", err);
    res.status(500).json({ error: "Unable to fetch submissions." });
  }
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;