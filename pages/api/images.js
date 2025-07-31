import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const files = fs.readdirSync(uploadsDir);
  const urls = files.map((file) => `./uploads/${file}`);
  res.status(200).json(urls);
}
