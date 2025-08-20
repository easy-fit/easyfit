// src/server.ts
import { app } from './app';
import { connectDB } from './config/db';
import { ENV } from './config/env';
import http from 'http';
import { WebSocketOrchestrator } from './sockets/websocket.orchestrator';

const startServer = async () => {
  await connectDB();

  const PORT = ENV.PORT || 3000;
  const server = http.createServer(app);

  // Initialize WebSocket orchestrator for real-time communication
  const wsOrchestrator = new WebSocketOrchestrator(server);

  // Make WebSocket orchestrator available globally
  (global as any).wsOrchestrator = wsOrchestrator;

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server initialized`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
