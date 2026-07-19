import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { getKrishiSathiResponse } from './src/services/ai.service';
import { AiInteraction } from './src/models/AiInteraction';

async function test() {
  await mongoose.connect(process.env.MONGO_URI as string);
  
  const dummyUserId = new mongoose.Types.ObjectId().toString();
  console.log('Testing AI for user:', dummyUserId);
  
  const response = await getKrishiSathiResponse(dummyUserId, 'What is the price of tomatoes in Nashik?', 'en');
  console.log('--- AI Response ---');
  console.log(response);
  
  process.exit(0);
}
test().catch(console.error);
