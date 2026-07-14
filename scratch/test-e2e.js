const mongoose = require('mongoose');
const { Schema } = mongoose;

// Minimal schema configuration to map to User collection without needing TS model imports
const userSchema = new Schema(
  {
    name: String,
    email: String,
    phone: String,
    passwordHash: String,
    role: String,
    kycStatus: String,
    kycDocument: String,
  },
  { collection: 'users' }
);
const User = mongoose.models.User || mongoose.model('User', userSchema);

const mongoUri = 'mongodb+srv://shubhamshevkar:India2020@cluster0.svlqgzo.mongodb.net/agribridge?retryWrites=true&w=majority';
const apiBase = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- E2E VERIFICATION TEST RUNNER ---');

  // Connect to DB directly
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB directly for verification checks.');

  // Clean old test accounts
  await User.deleteMany({ phone: { $in: ['9999999999', '8888888888'] } });
  console.log('Cleaned old test users from database.');

  // 1. Path 1: Successful KYC Onboarding
  const kycBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  
  console.log('\n[TEST 1] Testing Signup WITH KYC Document upload...');
  try {
    const signupKycRes = await fetch(`${apiBase}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test KYC Farmer',
        phone: '9999999999',
        password: 'password123',
        role: 'farmer',
        kycDocument: kycBase64Image
      })
    });
    const signupData = await signupKycRes.json();
    console.log('Signup WITH KYC response body:', JSON.stringify(signupData, null, 2));

    // Verify DB entry
    const kycUserDoc = await User.findOne({ phone: '9999999999' });
    console.log('MongoDB User Document in database:');
    console.log(JSON.stringify(kycUserDoc, null, 2));
  } catch (err) {
    console.error('Test 1 Failed:', err);
  }

  // 2. Path 2: Skipped KYC Onboarding
  console.log('\n[TEST 2] Testing Signup WITHOUT KYC Document (Skip Path)...');
  try {
    const signupSkipRes = await fetch(`${apiBase}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Skip Farmer',
        phone: '8888888888',
        password: 'password123',
        role: 'farmer'
      })
    });
    const skipData = await signupSkipRes.json();
    console.log('Signup WITHOUT KYC response body:', JSON.stringify(skipData, null, 2));

    // Verify DB entry
    const skipUserDoc = await User.findOne({ phone: '8888888888' });
    console.log('MongoDB User Document in database:');
    console.log(JSON.stringify(skipUserDoc, null, 2));
  } catch (err) {
    console.error('Test 2 Failed:', err);
  }

  // 3. Trace Login End-to-End
  console.log('\n[TEST 3] Tracing Login End-to-End...');
  try {
    const loginRes = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrPhone: '9999999999',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login API Response Body (User lookup -> bcrypt compare -> JWT token output):');
    console.log(JSON.stringify(loginData, null, 2));
  } catch (err) {
    console.error('Test 3 Failed:', err);
  }

  await mongoose.disconnect();
  console.log('\nDirect database connection closed. Tests complete.');
}

runTests().catch(console.error);
