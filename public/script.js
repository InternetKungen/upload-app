const form = document.getElementById("uploadForm");
const spinner = document.getElementById("spinner");
const status = document.getElementById("status");
const progressBar = document.getElementById("progressBar");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Välj en fil först!");

  const CHUNK_SIZE = 3 * 1024 * 1024; // 3MB per chunk
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  spinner.style.display = "block";
  progressBar.style.width = "0%";
  status.textContent = "Laddar upp...";

  function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  }

  const safeName = sanitizeFilename(file.name);

  // --- Funktion för att skicka en chunk med retry ---
  async function uploadChunkWithRetry(formData, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetch("/upload-chunk", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return; // lyckades
      } catch (err) {
        console.warn(
          `Chunk misslyckades, försök ${attempt} av ${retries}`,
          err
        );
        if (attempt === retries) throw err; // slutgiltigt fail
        await new Promise((r) => setTimeout(r, 500)); // liten paus innan retry
      }
    }
  }

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

    await uploadChunkWithRetry(formData);

    const percent = Math.round(((i + 1) / totalChunks) * 100);
    progressBar.style.width = percent + "%";
    status.textContent = `Laddar upp... ${percent}%`;
  }

  // --- Merge alla chunkar ---
  try {
    const mergeRes = await fetch("/merge-chunks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: safeName, totalChunks }),
    });

    const mergeText = await mergeRes.text();
    status.textContent = mergeText;
    progressBar.style.width = "100%";
  } catch (err) {
    status.textContent = "Ett fel uppstod vid sammanslagning av filen.";
    console.error(err);
  } finally {
    spinner.style.display = "none";
  }
});
