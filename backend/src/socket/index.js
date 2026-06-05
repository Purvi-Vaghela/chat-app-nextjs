import { Server } from 'socket.io';
import { handleUserOnline, handleUserDisconnect } from './handlers/userHandler.js';
import { handleConversationRoom, handleGroupRoom } from './handlers/roomHandler.js';
import { handleConversationMessage, handleGroupMessage } from './handlers/messageHandler.js';
import { handleConversationTyping, handleGroupTyping } from './handlers/typingHandler.js';

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Socket.io connection handler
  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // Register all event handlers
    handleUserOnline(io)(socket);
    handleConversationRoom()(socket);
    handleGroupRoom()(socket);
    handleConversationMessage(io)(socket);
    handleGroupMessage(io)(socket);
    handleConversationTyping()(socket);
    handleGroupTyping()(socket);
    handleUserDisconnect(io)(socket);
  });

  return io;
};
