const fs = require("fs").promises;
const path = require("path");

const handler = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const storagePath = path.join(process.cwd(), "server", "submissions.json");

  try {
    const content = await fs.readFile(storagePath, "utf8");
    const submissions = JSON.parse(content || "[]");
    res.status(200).json(submissions);
  } catch (err) {
    console.log("Failed to read submissions:", err);
    res.status(500).json({ error: "Unable to fetch submissions." });
  }
};

module.exports = handler;