require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 5000;

/* =======================
   Middleware
======================= */
app.use(
  cors({
    origin: "https://gigflowfront.netlify.app/",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

/* =======================
   Create HTTP Server
======================= */
const server = http.createServer(app);

/* =======================
   Socket.io Setup
======================= */
const io = new Server(server, {
  cors: {
    origin: "https://gigflowfront.netlify.app/",
    credentials: true,
  },
});

// Make io accessible in routes/controllers
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("join", (userId) => {
    console.log("📩 Join event received from socket:", socket.id);
    console.log("👤 UserId to join:", userId);

    socket.join(userId);

    console.log("✅ Socket rooms after join:", socket.rooms);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", socket.id, "Reason:", reason);
  });
});


/* =======================
   DB & Routes
======================= */
require("./app/config/db.config")(app);
require("./app/routes")(app);

/* =======================
   Start Server
======================= */
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


