import 'dotenv/config';
import http from 'http';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import app from './app';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { initializeSocket } from './config/socket';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Start server and connect to databases
const startServer = async () => {
  try {
    await connectDB();
    connectRedis();
    
    server.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
