// pages/api/images.js
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  try {
    const dir = path.join(process.cwd(), "public/uploads");
    const files = fs
      .readdirSync(dir)
      .filter((file) => /\.(jpg|jpeg)$/i.test(file));

    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "6");

    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedFiles = files.slice(start, end);
    const images = paginatedFiles.map((file, index) => ({
      id: start + index,
      url: `/uploads/${file}`,
    }));

    const hasMore = end < files.length;

    res.status(200).json({ images, hasMore });
  } catch (err) {
    console.error("Error reading images:", err);
    res.status(500).json({ error: "Failed to load images" });
  }
}
