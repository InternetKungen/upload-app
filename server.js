import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8099;

// Upload-mappar
const uploadDir = path.join(__dirname, "uploads");
const tempDir = path.join(uploadDir, "chunks");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

// Middleware för JSON
app.use(express.static("public"));
app.use(express.json());

// --- Helper: sanera filnamn ---
function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

// --- Multer storage för chunkar ---
const chunkStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    cb(null, file.originalname); // använder redan namngiven fil från klienten
  },
});
const uploadChunk = multer({ storage: chunkStorage });

// --- 1️⃣ Ta emot en chunk ---
app.post("/upload-chunk", uploadChunk.single("file"), (req, res) => {
  console.log(
    `Chunk mottagen: ${req.body.chunkIndex} / ${req.body.totalChunks} för ${req.body.filename}`
  );
  res.send(`Chunk ${req.body.chunkIndex} mottagen`);
});

// --- 2️⃣ Merge chunks ---
app.post("/merge-chunks", async (req, res) => {
  const { filename, totalChunks } = req.body;
  if (!filename || !totalChunks) {
    return res.status(400).send("Saknar filename eller totalChunks");
  }

  const safeName = sanitizeFilename(filename);
  const ext = path.extname(safeName);
  const base = path.basename(safeName, ext);
  const uniqueSuffix = "-" + Date.now() + "-" + Math.round(Math.random() * 1e9);
  const finalPath = path.join(uploadDir, `${base}${uniqueSuffix}${ext}`);

  const writeStream = fs.createWriteStream(finalPath);

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(tempDir, `${safeName}.part${i}`);
    if (!fs.existsSync(chunkPath)) {
      return res.status(400).send(`Chunk ${i} saknas`);
    }
    const data = fs.readFileSync(chunkPath);
    writeStream.write(data);
    fs.unlinkSync(chunkPath); // ta bort chunk
  }

  writeStream.end();
  res.send(`Filen "${filename}" har laddats upp och sammanslagits!`);
  console.log(`Filen "${filename}" färdigställd: ${finalPath}`);
});

// Starta server
app.listen(port, () => {
  console.log(`Server körs på http://localhost:${port}`);
});
