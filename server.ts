import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  app.use(express.json());

  // In-memory data storage (Reset on server restart)
  const grades: any[] = [
    { id: "1", name: "Shohakbar", grade: 5, date: new Date().toISOString() },
    { id: "2", name: "Student A", grade: 4, date: new Date().toISOString() },
  ];
  
  const messages: any[] = [];

  // API Routes
  app.get("/api/grades", (req, res) => {
    res.json(grades);
  });

  app.post("/api/grades", (req, res) => {
    const { password, name, grade } = req.body;
    if (password !== "2025") {
      return res.status(403).json({ error: "Incorrect password" });
    }
    const newGrade = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      grade,
      date: new Date().toISOString(),
    };
    grades.push(newGrade);
    io.emit("grade:added", newGrade);
    res.json(newGrade);
  });

  app.put("/api/grades/:id", (req, res) => {
    const { password, name, grade } = req.body;
    const { id } = req.params;
    if (password !== "2025") {
      return res.status(403).json({ error: "Incorrect password" });
    }
    const index = grades.findIndex((g) => g.id === id);
    if (index !== -1) {
      grades[index] = { ...grades[index], name, grade, date: new Date().toISOString() };
      io.emit("grade:updated", grades[index]);
      res.json(grades[index]);
    } else {
      res.status(404).json({ error: "Grade not found" });
    }
  });

  app.delete("/api/grades/:id", (req, res) => {
    const { password } = req.body;
    const { id } = req.params;
    if (password !== "2025") {
      return res.status(403).json({ error: "Incorrect password" });
    }
    const index = grades.findIndex((g) => g.id === id);
    if (index !== -1) {
      const deletedGrade = grades.splice(index, 1)[0];
      io.emit("grade:deleted", deletedGrade.id);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Grade not found" });
    }
  });

  // Socket.io for Real-time Chat
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    
    // Send message history
    socket.emit("chat:history", messages.slice(-50));

    socket.on("chat:message", (data) => {
      const msg = {
        id: Math.random().toString(36).substr(2, 9),
        user: data.user,
        text: data.text,
        timestamp: new Date().toISOString(),
      };
      messages.push(msg);
      // Keep history manageable
      if (messages.length > 500) messages.shift();
      
      io.emit("chat:message", msg);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
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

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
