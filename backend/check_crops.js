const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Let's get the Crop and User models
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Crop = mongoose.model('Crop', new mongoose.Schema({}, { strict: false }));

  const cropsCount = await Crop.countDocuments();
  console.log(`Total crops in DB: ${cropsCount}`);

  const crops = await Crop.find().lean();
  for (const crop of crops) {
    const farmer = await User.findById(crop.farmerId).lean();
    console.log(`\nCrop Name: ${crop.name}`);
    console.log(`Crop ID: ${crop._id}`);
    console.log(`Status: ${crop.status}`);
    console.log(`Quantity: ${crop.quantity}`);
    console.log(`Price per unit: ${crop.pricePerUnit}`);
    console.log(`Farmer ID: ${crop.farmerId}`);
    if (farmer) {
      console.log(`Farmer Name: ${farmer.name}`);
      console.log(`Farmer Role: ${farmer.role}`);
      console.log(`Farmer isDemoAccount: ${farmer.isDemoAccount}`);
      console.log(`Farmer location:`, farmer.location);
    } else {
      console.log(`Farmer NOT FOUND in DB!`);
    }
  }

  await mongoose.disconnect();
}

run();
