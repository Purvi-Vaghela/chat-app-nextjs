import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

// Import socket initialization
import { initializeSocket } from './socket/index.js';

// Import routes
import usersRouter from './routes/users.js';
import conversationsRouter from './routes/conversations.js';
import groupsRouter from './routes/groups.js';
import uploadRouter from './routes/upload.js';
import messagesRouter from './routes/messages.js';

// Import active users map for health check
import { activeUsers } from './socket/handlers/userHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = initializeSocket(httpServer);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Inject socket io into requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'ChatApp Socket Server Running',
    activeUsers: activeUsers.size
  });
});

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/messages', messagesRouter);

// Start server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
  console.log(`📡 Frontend CORS allowed from: ${process.env.FRONTEND_URL}`);
});
