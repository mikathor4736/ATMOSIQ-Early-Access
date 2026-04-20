const nodemailer = require("nodemailer");

const handler = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { firstName, lastName, email } = req.body || {};
  const ip =
    req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";

  let locationData = {};
  try {
    const geo = await fetch(`http://ip-api.com/json/${ip}`);
    locationData = await geo.json();
  } catch (err) {
    console.log("Geo lookup failed", err);
  }

  const newSignup = {
    firstName,
    lastName,
    email,
    ip,
    location: locationData,
    date: new Date().toISOString(),
  };

  console.log("New Signup:", newSignup);

  // Send thank you email
  try {
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

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
      console.log("Welcome email sent to:", email);
    } else {
      console.log("Email service not configured. Skipping email send.");
    }
  } catch (err) {
    console.log("Email send failed:", err.message);
    // Don't fail the signup if email fails
  }

  res.status(200).json({ success: true });
};

module.exports = handler;
