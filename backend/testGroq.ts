import mongoose from 'mongoose';
import { getKrishiSathiResponse } from './src/services/ai.service';
import { AiInteraction } from './src/models/AiInteraction';

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/agribridge');
  // clear history for new user
  const newUserId = new mongoose.Types.ObjectId().toString();
  const response = await getKrishiSathiResponse(newUserId, 'What is the price of tomatoes in Nashik?', 'en');
  console.log('Success:', response);
  process.exit(0);
}
test();
