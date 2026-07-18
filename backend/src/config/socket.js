"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const auction_service_1 = require("../services/auction.service");
let io;
const initializeSocket = (server) => {
    io = new socket_io_1.Server(server, {
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
                const success = await (0, auction_service_1.placeBidAtomic)(data.auctionId, data.userId, data.amount);
                if (!success) {
                    socket.emit('auction:error', { message: 'Bid was not high enough or auction ended' });
                }
                // If successful, placeBidAtomic automatically emits the 'auction:update' broadcast
            }
            catch (err) {
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
exports.initializeSocket = initializeSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
exports.getIO = getIO;
