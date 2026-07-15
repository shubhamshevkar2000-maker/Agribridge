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
    redisClient.setEx = async (k: string, t: number, v: any) => { mockRedisData[k] = v; return 'OK'; };
    redisClient.del = async (k: string) => { delete mockRedisData[k]; return 1; };
    redisClient.eval = async () => null;
    redisClient.lRange = async (k: string, start: number, stop: number) => {
      if (mockRedisData[k]) {
        try {
          return JSON.parse(mockRedisData[k]);
        } catch {
          return [];
        }
      }
      return [];
    };
    redisClient.sendCommand = async (args: string[]) => {
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
            try { history = JSON.parse(mockRedisData[historyKey]); } catch {}
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
