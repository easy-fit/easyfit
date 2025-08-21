// src/server.ts
import { app } from './app';
import { connectDB } from './config/db';
import { ENV } from './config/env';
import http from 'http';
import { WebSocketOrchestrator } from './sockets/websocket.orchestrator';
import { StoreStatusCronService } from './services/cron/storeStatusCron.service';

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
    
    // Start the store status cron job
    StoreStatusCronService.start();
  });
};

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  StoreStatusCronService.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  StoreStatusCronService.stop();
  process.exit(0);
});

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
