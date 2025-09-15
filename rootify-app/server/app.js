const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");

const app = express() ;
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get("/music-tree/:artistName", (req, res) => {
  const artist = decodeURIComponent(req.params.artistName); 
  console.log("Received request for artist:", artist);
  
  const pythonPath = "/Library/Frameworks/Python.framework/Versions/3.10/bin/python3"; 
  const scriptPath = path.join(__dirname, "music_tree.py");

  const python = spawn(pythonPath, [scriptPath, artist]);

  let data = "";
  let errors = "";

  python.stdout.on("data", (chunk) => {
    data += chunk.toString();
  });

  python.stderr.on("data", (chunk) => {
    errors += chunk.toString();  // ← accumulate errors
    console.error("Python stderr chunk:", chunk.toString());
  });

  python.on("close", (code) => {
    console.log("Python exited with code:", code);
    if (errors) console.error("Python stderr:", errors);

    try {
      const result = JSON.parse(data);
      res.json(result);
    } catch (err) {
      console.error("JSON parse error:", err);
      console.error("Raw Python output:", data);
      res.status(500).json({ error: "Server error" });
    }
  });
});


app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
