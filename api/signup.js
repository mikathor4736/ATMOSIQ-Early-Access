export default async function handler(req, res) {
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
  res.status(200).json({ success: true });
}
