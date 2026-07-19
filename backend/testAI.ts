import 'dotenv/config';
import mongoose from 'mongoose';
import { getKrishiSathiResponse } from './src/services/ai.service';

async function testAI() {
  await mongoose.connect(process.env.MONGO_URI || '');
  try {
    const res = await getKrishiSathiResponse('6a56126a798409c2bcef3971', 'What is the price of tomatoes in Nashik?', 'en');
    console.log('Success:', res);
  } catch (err) {
    console.error('Test Error:', err);
  } finally {
    mongoose.disconnect();
  }
}

testAI();
