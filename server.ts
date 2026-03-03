import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";

const db = new Database("app.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS prd_pages (
    step_id TEXT PRIMARY KEY,
    content TEXT
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/prd/:stepId", (req, res) => {
    const { stepId } = req.params;
    const row = db.prepare("SELECT content FROM prd_pages WHERE step_id = ?").get(stepId);
    res.json(row || { content: "" });
  });

  app.post("/api/prd/:stepId", (req, res) => {
    const { stepId } = req.params;
    const { content } = req.body;
    db.prepare(`
      INSERT INTO prd_pages (step_id, content) 
      VALUES (?, ?) 
      ON CONFLICT(step_id) DO UPDATE SET content = excluded.content
    `).run(stepId, content || "");
    res.json({ success: true });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
