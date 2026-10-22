// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var DATA_FILE = path.join(__dirname, "data", "questoes.json");
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
} else {
  try {
    const existing = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    if (!Array.isArray(existing)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (e) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}
async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.get("/api/questions", (req, res) => {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
        res.json({ success: true, questions: data });
      } else {
        res.json({ success: true, questions: [] });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app.post("/api/questions", (req, res) => {
    try {
      const newQuestions = req.body.questions;
      if (!Array.isArray(newQuestions)) {
        return res.status(400).json({ success: false, error: "Invalid format, expected questions array." });
      }
      let existing = [];
      if (fs.existsSync(DATA_FILE)) {
        try {
          existing = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
        } catch (e) {
          existing = [];
        }
      }
      const map = new Map(existing.map((q) => [q.id, q]));
      for (const q of newQuestions) {
        map.set(q.id, q);
      }
      const merged = Array.from(map.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2), "utf-8");
      res.json({ success: true, count: merged.length });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app.delete("/api/questions", (req, res) => {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
      res.json({ success: true, message: "Database cleared successfully" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
  const port = Number(process.env.PORT) || 3e3;
  app.listen(port, "0.0.0.0", () => {
    console.log(`AcertoCerto Pro running on port ${port}`);
  });
}
startServer();
