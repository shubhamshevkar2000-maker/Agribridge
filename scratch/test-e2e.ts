import mongoose from 'mongoose';
import { User } from '../../backend/src/models/User';
import axios from 'axios';
import 'dotenv/config';

// Load ENV variables
const mongoUri = 'mongodb+srv://shubhamshevkar:India2020@cluster0.svlqgzo.mongodb.net/agribridge?retryWrites=true&w=majority';
const apiBase = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- E2E VERIFICATION TEST RUNNER ---');

  // Connect to DB directly to verify document writes
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB directly for verification checks.');

  // Clean old test accounts
  await User.deleteMany({ phone: { $in: ['9999999999', '8888888888'] } });
  console.log('Cleaned old test users from database.');

  // 1. Path 1: Successful KYC Onboarding
  const kycBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  
  console.log('\n[TEST 1] Testing Signup WITH KYC Document upload...');
  try {
    const signupKycRes = await axios.post(`${apiBase}/auth/signup`, {
      name: 'Test KYC Farmer',
      phone: '9999999999',
      password: 'password123',
      role: 'farmer',
      kycDocument: kycBase64Image
    });
    console.log('Signup WITH KYC response body:', JSON.stringify(signupKycRes.data, null, 2));

    // Verify DB entry
    const kycUserDoc = await User.findOne({ phone: '9999999999' });
    console.log('MongoDB User Document in database:');
    console.log(JSON.stringify(kycUserDoc, null, 2));
  } catch (err: any) {
    console.error('Test 1 Failed:', err.response?.data || err.message);
  }

  // 2. Path 2: Skipped KYC Onboarding
  console.log('\n[TEST 2] Testing Signup WITHOUT KYC Document (Skip Path)...');
  try {
    const signupSkipRes = await axios.post(`${apiBase}/auth/signup`, {
      name: 'Test Skip Farmer',
      phone: '8888888888',
      password: 'password123',
      role: 'farmer'
    });
    console.log('Signup WITHOUT KYC response body:', JSON.stringify(signupSkipRes.data, null, 2));

    // Verify DB entry
    const skipUserDoc = await User.findOne({ phone: '8888888888' });
    console.log('MongoDB User Document in database:');
    console.log(JSON.stringify(skipUserDoc, null, 2));
  } catch (err: any) {
    console.error('Test 2 Failed:', err.response?.data || err.message);
  }

  // 3. Trace Login End-to-End
  console.log('\n[TEST 3] Tracing Login End-to-End...');
  try {
    const loginRes = await axios.post(`${apiBase}/auth/login`, {
      emailOrPhone: '9999999999',
      password: 'password123'
    });
    console.log('Login API Response Body (User lookup -> bcrypt compare -> JWT token output):');
    console.log(JSON.stringify(loginRes.data, null, 2));
  } catch (err: any) {
    console.error('Test 3 Failed:', err.response?.data || err.message);
  }

  await mongoose.disconnect();
  console.log('\nDirect database connection closed. Tests complete.');
}

runTests().catch(console.error);
