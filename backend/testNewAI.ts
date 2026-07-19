import mongoose from 'mongoose';
import { getKrishiSathiResponse } from './src/services/ai.service';
import { AiInteraction } from './src/models/AiInteraction';

async function test() {
  await mongoose.connect('mongodb://localhost:27017/agribridge');
  // delete history for this dummy user
  await AiInteraction.deleteMany({ userId: '6a56126a798409c2bcef3971' });
  const response = await getKrishiSathiResponse('6a56126a798409c2bcef3971', 'What is the price of potatoes in Mumbai?', 'en');
  console.log('Success:', response);
  process.exit(0);
}
test();
