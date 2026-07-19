import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { User } from './src/models/User';
import { Crop } from './src/models/Crop';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  const farmer = await User.findOne({ role: 'farmer' });
  if (!farmer) throw new Error('No farmer found');
  
  let crop = await Crop.findOne({ farmerId: farmer._id, status: 'listed' });
  if (!crop) {
     crop = await Crop.create({
       farmerId: farmer._id,
       name: 'Wheat',
       category: 'cereal',
       quantity: 100,
       unit: 'kg',
       pricePerUnit: 200,
       status: 'listed'
     });
  }
  
  const token = jwt.sign({ id: farmer._id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
  
  const payload = {
    cropId: crop._id.toString(),
    startingBid: 1000,
    minIncrement: 100,
    reservePrice: 1500,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 86400000).toISOString(),
    quantity: 10,
    notes: 'Test auction'
  };
  
  console.log('Sending POST /api/auctions', payload);
  
  const res = await fetch('http://localhost:5000/api/auctions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  
  console.log('Status:', res.status);
  console.log('Response:', await res.text());
  
  process.exit(0);
}
run().catch(console.error);
