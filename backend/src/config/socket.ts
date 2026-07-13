import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

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
    // (In a real app, you'd verify the JWT and call placeBidAtomic here)
    socket.on('auction:bid', async (data) => {
      console.log('Received bid attempt via socket:', data);
      // Actual logic would be: await placeBidAtomic(data.auctionId, data.userId, data.amount);
      // For mocking the frontend experience easily, we'll directly broadcast here as a stub
      io!.to(`auction_${data.auctionId}`).emit('auction:update', {
        auctionId: data.auctionId,
        highestBid: data.amount,
        highestBidder: data.userId,
        timestamp: new Date().toISOString(),
        isMock: true // Flag to show it bypassed Redis for the UI demo
      });
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
