import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { getKrishiSathiResponse } from './src/services/ai.service';

async function test() {
  await mongoose.connect(process.env.MONGO_URI as string);
  const dummyUserId = new mongoose.Types.ObjectId().toString();
  
  const response = await getKrishiSathiResponse(dummyUserId, 'What is the price of exotic dragonfruit in Mumbai?', 'en');
  console.log('--- AI Response ---');
  console.log(response);
  process.exit(0);
}
test().catch(console.error);
