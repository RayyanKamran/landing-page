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

  const uploadDir = path.join(process.cwd(), "./uploads");

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

    // Assuming you're uploading a single file with field name 'file'
    const uploadedFile = files.file?.[0] || files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = uploadedFile.filepath || uploadedFile.path;
    const fileName = path.basename(filePath);

    return res.status(200).json({
      message: "File uploaded successfully",
      fileUrl: `/uploads/${fileName}`,
    });
  });
}
