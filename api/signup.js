const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[A-Za-z]+$/;

const handler = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { firstName, lastName, email } = req.body || {};

  if (!NAME_REGEX.test(firstName)) {
    return res.status(400).json({ error: "First name must contain letters only." });
  }
  if (!NAME_REGEX.test(lastName)) {
    return res.status(400).json({ error: "Last name must contain letters only." });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "Please check the email format is correct. Example: test@test.com" });
  }

  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";

  let locationData = {};
  try {
    const geo = await fetch(`http://ip-api.com/json/${ip}`);
    locationData = await geo.json();
  } catch (err) {
    console.log("Geo lookup failed", err);
  }

  const submission = {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    email,
    ip,
    location: locationData,
    date: new Date().toISOString(),
  };

  const storagePath = path.join(process.cwd(), "server", "submissions.json");

  try {
    await fs.mkdir(path.dirname(storagePath), { recursive: true });
    const existingContent = await fs.readFile(storagePath, "utf8").catch(() => "[]");
    const existingData = JSON.parse(existingContent || "[]");
    existingData.push(submission);
    await fs.writeFile(storagePath, JSON.stringify(existingData, null, 2), "utf8");
  } catch (err) {
    console.log("Failed to write signup data:", err);
    return res.status(500).json({ error: "Unable to store signup data." });
  }

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to the ATMOSIQ Family!",
        html: `
          <h2>Welcome to ATMOSIQ!</h2>
          <p>Dear ${firstName} ${lastName},</p>
          <p>Thank you for joining the ATMOSIQ family! We pride ourselves in keeping our family and community safe while providing the most comprehensive weather data and predictive AI weather to you.</p>
          <p>We're thrilled to have you on board and look forward to revolutionizing how you experience weather intelligence.</p>
          <p>Stay safe and weather-aware!</p>
          <p>The ATMOSIQ Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Welcome email sent to:", email);
    } else {
      console.log("Email service not configured. Skipping email send.");
    }
  } catch (err) {
    console.log("Email send failed:", err.message);
  }

  res.status(200).json({ success: true, submission });
};

module.exports = handler;
