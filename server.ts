import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { simplifyPath, SpatialHashSet, Heap } from "./src/lib/dsa.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  /**
   * REQ-06: Polygon Post-Processing
   * Validates a path, checks for loop completion (REQ-03), and simplifies.
   */
  app.post("/api/process-path", (req, res) => {
    const { points, tolerance = 0.00001 } = req.body; // tolerance in degrees (~1m)
    
    if (!points || points.length < 3) {
      return res.status(400).json({ error: "Insufficient points" });
    }

    // 1. Loop Detection (DSA: Spatial Hash Set)
    const spatialHash = new SpatialHashSet(5); // 5m grid
    let loopStartIndex = -1;
    let loopEndIndex = -1;

    for (let i = 0; i < points.length; i++) {
      const [lat, lng] = points[i];
      const existing = spatialHash.getIndices(lat, lng);
      
      if (existing.length > 0) {
        // Found a potential loop
        // We take the first point that overlaps as the loop start
        loopStartIndex = existing[0];
        loopEndIndex = i;
        break;
      }
      spatialHash.add(lat, lng, i);
    }

    if (loopStartIndex === -1) {
      return res.json({ 
        isLoop: false, 
        processedPoints: simplifyPath(points, tolerance) 
      });
    }

    // Extract the loop portion
    const loopPoints = points.slice(loopStartIndex, loopEndIndex + 1);
    
    // 2. Simplification (DSA: Douglas-Peucker)
    const simplified = simplifyPath(loopPoints, tolerance);

    res.json({
      isLoop: true,
      loopStartIndex,
      loopEndIndex,
      originalCount: loopPoints.length,
      simplifiedCount: simplified.length,
      processedPoints: simplified
    });
  });

  /**
   * REQ-10: Leaderboard System (DSA: Max-Heap)
   */
  app.get("/api/leaderboard", (req, res) => {
    // In a real app, we'd fetch this from DB. 
    // Here we demonstrate the Heap logic.
    const mockUsers = [
      { id: "1", tag: "Flash", score: 12500 },
      { id: "2", tag: "Bolt", score: 45000 },
      { id: "3", tag: "RunnerX", score: 8200 },
      { id: "4", tag: "Sonic", score: 68000 },
    ];

    const maxHeap = new Heap<{id: string, tag: string, score: number}>((a, b) => b.score - a.score);
    mockUsers.forEach(u => maxHeap.push(u));

    res.json(maxHeap.toArray());
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
