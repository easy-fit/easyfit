// src/server.ts
import { app } from './app';
import { connectDB } from './config/db';
import { ENV } from './config/env';
import http from 'http';

const startServer = async () => {
  await connectDB();

  const PORT = ENV.PORT || 3000;
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
