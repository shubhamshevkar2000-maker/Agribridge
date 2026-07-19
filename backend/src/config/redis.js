"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redisClient = void 0;
const redis_1 = require("redis");
let client;
const mockRedisData = {};
try {
    client = (0, redis_1.createClient)({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: { reconnectStrategy: false } // Do not reconnect on Windows to avoid log spam
    });
    client.on('error', (err) => console.log('Redis Client Error (ignored)'));
}
catch (e) {
    client = { get: async () => null, set: async () => null };
}
exports.redisClient = client;
const connectRedis = async () => {
    try {
        await exports.redisClient.connect();
        console.log('Redis connected successfully');
    }
    catch (error) {
        console.log('Error connecting to Redis. Proceeding without Redis.');
        exports.redisClient.get = async (k) => mockRedisData[k] || null;
        exports.redisClient.set = async (k, v) => { mockRedisData[k] = v; return 'OK'; };
        exports.redisClient.setEx = async (k, t, v) => { mockRedisData[k] = v; return 'OK'; };
        exports.redisClient.del = async (k) => { delete mockRedisData[k]; return 1; };
        exports.redisClient.eval = async () => null;
        exports.redisClient.lRange = async (k, start, stop) => {
            if (mockRedisData[k]) {
                try {
                    return JSON.parse(mockRedisData[k]);
                }
                catch {
                    return [];
                }
            }
            return [];
        };
        exports.redisClient.sendCommand = async (args) => {
            if (args[0] === 'EVAL') {
                const key = args[3];
                const historyKey = args[4];
                const bidAmount = parseInt(args[5], 10);
                const buyerId = args[6];
                const bidderName = args[7];
                const current = mockRedisData[key] ? parseInt(mockRedisData[key], 10) : 0;
                const currentBuyer = mockRedisData[key + ':buyer'];
                if (bidAmount > current) {
                    mockRedisData[key] = bidAmount.toString();
                    mockRedisData[key + ':buyer'] = buyerId;
                    let history = [];
                    if (mockRedisData[historyKey]) {
                        try {
                            history = JSON.parse(mockRedisData[historyKey]);
                        }
                        catch { }
                    }
                    history.unshift(`${buyerId}|${bidderName}|${bidAmount}`);
                    mockRedisData[historyKey] = JSON.stringify(history);
                    return currentBuyer || "";
                }
                return "0";
            }
            return null;
        };
    }
};
exports.connectRedis = connectRedis;
