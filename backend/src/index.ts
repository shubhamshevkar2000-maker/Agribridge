import 'dotenv/config';
import http from 'http';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import app from './app';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { initializeSocket } from './config/socket';
import { Auction } from './models/Auction';
import { completeAuction } from './services/auction.service';

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
      
      const groqKey = process.env.GROQ_API_KEY;
      if (groqKey) {
        console.log(`Groq key loaded: ${groqKey.substring(0, 4)}...${groqKey.substring(groqKey.length - 4)}`);
      } else {
        console.log('Groq key NOT loaded');
      }

      const weatherKey = process.env.OPENWEATHER_API_KEY;
      if (weatherKey) {
        console.log(`OpenWeather key loaded: ${weatherKey.substring(0, 4)}...${weatherKey.substring(weatherKey.length - 4)}`);
      } else {
        console.log('OpenWeather key NOT loaded');
      }

      // Background Worker to manage auction states
      setInterval(async () => {
        try {
          const now = new Date();

          // 1. Transition scheduled auctions to live
          const scheduledAuctions = await Auction.find({
            status: 'scheduled',
            startTime: { $lte: now }
          });
          for (const auction of scheduledAuctions) {
            console.log(`Starting scheduled auction ${auction._id}`);
            auction.status = 'live';
            await auction.save();
          }

          // 2. Close expired live auctions
          const expiredAuctions = await Auction.find({ 
            status: 'live', 
            endTime: { $lte: now } 
          });
          for (const auction of expiredAuctions) {
            console.log(`Closing expired auction ${auction._id}`);
            await completeAuction(auction._id.toString());
          }
        } catch (err) {
          console.error("Error in auction background worker:", err);
        }
      }, 10000); // Check every 10 seconds

    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
