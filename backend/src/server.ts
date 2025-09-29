import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { GameService } from './services/gameService';
import { SocketHandlers } from './handlers/socketHandlers';

const app = express();
const server = createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-frontend-domain.com'] 
      : ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Game statistics endpoint
app.get('/stats', (req, res) => {
  const gameService = new GameService();
  const rooms = gameService.getAllRooms();
  
  res.json({
    totalRooms: rooms.length,
    activeGames: rooms.filter(r => r.gameStarted).length,
    totalPlayers: rooms.reduce((acc, room) => acc + room.players.length, 0)
  });
});

// Serve static files from frontend build in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  
  // Serve static files
  app.use(express.static(frontendPath));
  
  // Handle React routing - return index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Initialize game service
const gameService = new GameService();

// Set up socket handlers
const socketHandlers = new SocketHandlers(io, gameService);

// Handle socket connections
io.on('connection', (socket) => {
  socketHandlers.handleConnection(socket);
});

// Clean up old rooms every hour
setInterval(() => {
  gameService.cleanupOldRooms();
  console.log('Cleaned up old rooms');
}, 60 * 60 * 1000);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🐺 One Night a Werewolf server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { app, server, io };
