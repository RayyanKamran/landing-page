import fs from "fs";
import path from "path";

export default function handler(req, res) {
  try {
    const dataPath = path.join(process.cwd(), "public/uploads/data.json");

    // If the file doesn't exist yet, return empty
    if (!fs.existsSync(dataPath)) {
      return res.status(200).json({ images: [], hasMore: false });
    }

    const jsonData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "6");

    const start = (page - 1) * limit;
    const end = start + limit;

    const paginated = jsonData.slice(start, end);
    const hasMore = end < jsonData.length;

    res.status(200).json({ images: paginated, hasMore });
  } catch (err) {
    console.error("Error reading images:", err);
    res.status(500).json({ error: "Failed to load images" });
  }
}
