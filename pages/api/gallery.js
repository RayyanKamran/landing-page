import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const jsonPath = path.join(process.cwd(), "./public/uploads/data.json");

  if (!fs.existsSync(jsonPath)) {
    return res.status(200).json([]);
  }

  const data = fs.readFileSync(jsonPath, "utf-8");
  const parsed = JSON.parse(data || "[]");

  return res.status(200).json(parsed);
}
