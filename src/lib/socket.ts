import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket: Socket) => {
    socket.join("kds");
    console.log(`[socket.io] client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`[socket.io] client disconnected: ${socket.id}`);
    });
  });

  console.log("[socket.io] server initialized with kds room");
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error("Socket.io not initialized — call initSocketIO first");
  return io;
}
