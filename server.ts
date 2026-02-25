import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Database
const dbPath = path.join(__dirname, "garden.db");
const db = new Database(dbPath);

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS flowers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    color TEXT NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    message TEXT NOT NULL,
    author TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    likes INTEGER DEFAULT 0
  )
`);

// Migration for existing tables
try {
  db.exec("ALTER TABLE flowers ADD COLUMN likes INTEGER DEFAULT 0");
} catch (err) {
  // Column likely exists, ignore
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Get all flowers
  app.get("/api/flowers", (req, res) => {
    console.log("GET /api/flowers hit");
    const isAdmin = req.headers["x-admin-secret"] === process.env.ADMIN_SECRET || req.headers["x-admin-secret"] === "fariha123"; 
    
    try {
      const flowers = db.prepare("SELECT * FROM flowers").all();
      
      const sanitizedFlowers = flowers.map((f: any) => ({
        ...f,
        message: isAdmin ? f.message : undefined, 
        isLocked: !isAdmin
      }));

      res.json(sanitizedFlowers);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Plant a flower
  app.post("/api/flowers", (req, res) => {
    const { type, color, x, y, message, author } = req.body;
    
    if (!type || !color || x === undefined || y === undefined || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const stmt = db.prepare("INSERT INTO flowers (type, color, x, y, message, author) VALUES (?, ?, ?, ?, ?, ?)");
    const info = stmt.run(type, color, x, y, message, author || "Anonymous");
    
    res.json({ id: info.lastInsertRowid, success: true });
  });

  // Like a flower
  app.post("/api/flowers/:id/like", (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare("UPDATE flowers SET likes = likes + 1 WHERE id = ?");
    const info = stmt.run(id);
    if (info.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Flower not found" });
    }
  });

  // Update flower position
  app.patch("/api/flowers/:id/position", (req, res) => {
    const { id } = req.params;
    const { x, y } = req.body;
    
    if (x === undefined || y === undefined) {
      return res.status(400).json({ error: "Missing x or y" });
    }

    const stmt = db.prepare("UPDATE flowers SET x = ?, y = ? WHERE id = ?");
    const info = stmt.run(x, y, id);
    
    if (info.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Flower not found" });
    }
  });

  // Admin Login Check
  app.post("/api/login", (req, res) => {
    const { password } = req.body;
    // In a real app, use hashed passwords and env vars. 
    // For this romantic gift, a simple check is fine.
    if (password === "fariha123" || password === process.env.ADMIN_PASSWORD) {
      res.json({ success: true, token: "fariha123" });
    } else {
      res.status(401).json({ success: false, error: "Incorrect password" });
    }
  });

  // API 404 Handler - prevent falling through to Vite for API requests
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
