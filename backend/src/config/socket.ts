import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { placeBidAtomic } from '../services/auction.service';

let io: Server;

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*', // For dev
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join user-specific room for notifications
    socket.on('join_user', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their notification room`);
    });

    // Join specific auction room
    socket.on('auction:join', (auctionId) => {
      socket.join(`auction_${auctionId}`);
      console.log(`Socket ${socket.id} joined auction_${auctionId}`);
    });

    // Handle incoming bid requests from clients
    socket.on('auction:bid', async (data) => {
      console.log('Received bid attempt via socket:', data);
      try {
        const success = await placeBidAtomic(data.auctionId, data.userId, data.amount);
        if (!success) {
          socket.emit('auction:error', { message: 'Bid was not high enough or auction ended' });
        }
        // If successful, placeBidAtomic automatically emits the 'auction:update' broadcast
      } catch (err: any) {
        console.error('Bid error:', err);
        socket.emit('auction:error', { message: 'Internal server error processing bid' });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
