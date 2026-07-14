import { createClient } from 'redis';

let client: any;
const mockRedisData: Record<string, string> = {};

try {
  client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: { reconnectStrategy: false } // Do not reconnect on Windows to avoid log spam
  });

  client.on('error', (err: any) => console.log('Redis Client Error (ignored)'));
} catch (e) {
  client = { get: async () => null, set: async () => null };
}

export const redisClient = client;

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.log('Error connecting to Redis. Proceeding without Redis.');
    redisClient.get = async (k: string) => mockRedisData[k] || null;
    redisClient.set = async (k: string, v: any) => { mockRedisData[k] = v; return 'OK'; };
    redisClient.eval = async () => null;
    redisClient.sendCommand = async (args: string[]) => {
      if (args[0] === 'EVAL') {
        const key = args[3];
        const bidAmount = parseInt(args[4], 10);
        const buyerId = args[5];
        const current = mockRedisData[key] ? parseInt(mockRedisData[key], 10) : 0;
        if (bidAmount > current) {
          mockRedisData[key] = bidAmount.toString();
          mockRedisData[key + ':buyer'] = buyerId;
          return 1;
        }
        return 0;
      }
      return null;
    };
  }
};
