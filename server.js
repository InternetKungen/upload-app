import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8099;

// Se till att mappen finns
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer-inställning
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
  const uniqueSuffix = "-" + Date.now() + "-" + Math.round(Math.random() * 1E9);
  const ext = path.extname(file.originalname);
  const base = path.basename(file.originalname, ext);

  // Bygg nytt filnamn: originalnamn + suffix + extension
  cb(null, `${base}${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

// Servera statiska filer
app.use(express.static("public"));

// Route för uppladdning
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("Ingen fil uppladdad");
  res.send(`Filen "${req.file.originalname}" har laddats upp!`);
  console.log(`Uppladdad fil: ${req.file.path}`);
});

// Starta servern
app.listen(port, () => {
  console.log(`Server körs på http://localhost:${port}`);
});
