require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;

/* =======================
   Allowed Origins
======================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://gigflowfront.netlify.app",
];

/* =======================
   Middleware
======================= */
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server or tools like Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
    origin: allowedOrigins,
    credentials: true,
  },
});

// Make io available in controllers
app.set("io", io);

/* =======================
   Socket Events
======================= */
io.on("connection", (socket) => {
  console.log(" Socket connected:", socket.id);

  socket.on("join", (userId) => {
    if (!userId) {
      console.log("join ignored: no userId");
      return;
    }

    socket.join(userId);
    console.log( User ${userId} joined room);
    console.log("Rooms:", [...socket.rooms]);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", socket.id, "Reason:", reason);
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
  console.log(Server running on port ${PORT});
});

