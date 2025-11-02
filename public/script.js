const form = document.getElementById("uploadForm");
const spinner = document.getElementById("spinner");
const status = document.getElementById("status");
const progressBar = document.getElementById("progressBar");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Välj en fil först!");

  // --- Anpassa chunk-storlek för testning ---
  const CHUNK_SIZE = 3 * 1024 * 1024; // 3MB per chunk
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  spinner.style.display = "block";
  progressBar.style.width = "0%";
  status.textContent = "Laddar upp...";

  function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  }

  const safeName = sanitizeFilename(file.name);

  // --- Skicka alla chunks ---
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("file", chunk, `${safeName}.part${i}`);
    formData.append("filename", safeName);
    formData.append("chunkIndex", i);
    formData.append("totalChunks", totalChunks);

    const res = await fetch("/upload-chunk", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(`Chunk ${i} misslyckades: ${res.status}`);

    const percent = Math.round(((i + 1) / totalChunks) * 100);
    progressBar.style.width = percent + "%";
    status.textContent = `Laddar upp... ${percent}%`;
  }

  // --- Merge alla chunkar ---
  const mergeRes = await fetch("/merge-chunks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: safeName, totalChunks }),
  });

  const mergeText = await mergeRes.text();
  spinner.style.display = "none";
  status.textContent = mergeText;
  progressBar.style.width = "100%";
});
