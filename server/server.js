import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { ACTIONS } from "./Actions.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://code-collaborator-git-main-maniacayus-projects.vercel.app",
    withCredentials: true,
  },
});

const userSocketMap = new Map();

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
};
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on(ACTIONS.JOIN, (req, res) => {
    const { username, roomId } = req;
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });
    
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => { 
    console.log("Hey I am here");
    console.log(roomId);
    console.log(userSocketMap);
    console.log(getAllConnectedClients(roomId)); //
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {code})
    });
    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => { 
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, {code});
    })

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
