import formidable from "formidable";
import fs from "fs";
import path from "path";

// Disable Next.js default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uploadDir = path.join(process.cwd(), "./public/uploads");

  // Ensure the upload directory exists
  fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Formidable error:", err);
      return res.status(500).json({ error: "Error parsing the files" });
    }

    const uploadedFile = files.file?.[0] || files.file;
    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = uploadedFile.filepath || uploadedFile.path;
    const fileName = path.basename(filePath);
    const fileUrl = `/uploads/${fileName}`;

    // Extract position and size from fields
    let position = {};
    let size = {};

    try {
      if (fields.position) {
        position = JSON.parse(fields.position?.[0] || fields.position);
      }
      if (fields.size) {
        size = JSON.parse(fields.size?.[0] || fields.size);
      }
    } catch (parseErr) {
      console.error("Failed to parse position/size JSON", parseErr);
      return res.status(400).json({ error: "Invalid position or size format" });
    }

    //SAVE METADATA TO data.json
    const uploadsJsonPath = path.join(
      process.cwd(),
      "./public/uploads/data.json"
    );

    let existing = [];
    if (fs.existsSync(uploadsJsonPath)) {
      const raw = fs.readFileSync(uploadsJsonPath, "utf-8");
      try {
        existing = raw.trim() ? JSON.parse(raw) : [];
      } catch (e) {
        console.error("Failed to parse uploads JSON:", e);
        existing = []; // fallback to empty if malformed
      }
    }

    const newEntry = {
      url: fileUrl,
      position,
      size,
      uploadedAt: new Date().toISOString(),
    };

    existing.push(newEntry);

    fs.writeFileSync(uploadsJsonPath, JSON.stringify(existing, null, 2));

    return res.status(200).json({
      message: "File uploaded successfully",
      fileUrl,
      position,
      size,
    });
  });
}
