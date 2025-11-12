# Upload App

A simple file upload application built with **Node.js**, **Express**, and **Multer**.
This app supports **chunked uploads**, meaning large files can be uploaded in smaller parts (chunks) and then reassembled on the server.

---

## 🚀 Features

* Upload files through a simple web interface
* Chunked upload support for large files
* Automatic merging of uploaded chunks into a single file
* Built with lightweight and minimal dependencies
* Easy to set up and run locally

---

## 🛠️ Tech Stack

* **Node.js** – JavaScript runtime
* **Express** – Web framework
* **Multer** – Middleware for handling file uploads

---

## 📦 Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/InternetKungen/upload-app.git
   cd upload-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

---

## ▶️ Usage

Start the server:

```bash
npm start
```

By default, the app runs on **[http://localhost:3000](http://localhost:3000)** (unless otherwise specified in `server.js`).

You can then open the upload page in your browser and test file uploads.

---

## ⚙️ How It Works

1. Files are uploaded in smaller **chunks** rather than a single large upload.
2. Each chunk is temporarily stored on the server.
3. Once all chunks are uploaded, the app merges them into a complete file.
4. The final file can then be found in the output directory (e.g., `/uploads`).

---

## 🧩 Project Structure

```
upload-app/
│
├── server.js          # Express server setup
├── package.json       # Project metadata and dependencies
└── public/            # Frontend files (upload form, etc.)
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

Would you like me to include example frontend code (an HTML upload form with chunk handling) or keep the README focused on the backend setup?
