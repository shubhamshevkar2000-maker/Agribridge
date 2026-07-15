const http = require('http');

const API = 'http://127.0.0.1:5000/api';
let f1Token, b1Token;
let cropId, orderId;

async function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request(API + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(resData)); } catch(e) { resolve(resData); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runAudit() {
  console.log("=== STARTING AGRIBRIDGE AUDIT ===\n");

  // 1. Create Users
  console.log("[Setup] Creating users...");
  const fPhone = '999' + Math.floor(1000000 + Math.random() * 9000000);
  const bPhone = '998' + Math.floor(1000000 + Math.random() * 9000000);
  
  let f1 = await request('POST', '/auth/signup', { name: 'Audit Farmer', phone: fPhone, password: 'password', role: 'farmer', location: { coordinates: [73.85, 18.52] } });
  let b1 = await request('POST', '/auth/signup', { name: 'Audit Buyer', phone: bPhone, password: 'password', role: 'buyer' });
  
  f1Token = f1.data?.token;
  b1Token = b1.data?.token;

  // 1. Live Auction Check
  console.log("\n--- 1. Live Auction Test ---");
  const crop = await request('POST', '/crops', { name: 'Audit Wheat', category: 'Grains', quantity: 100, unit: 'Quintals', pricePerUnit: 2000, description: 'Test', status: 'listed' }, f1Token);
  if (crop.success) {
    cropId = crop.data._id;
    console.log("Crop listed successfully.");
    const auction = await request('POST', '/auctions', { cropId, startingBid: 2100, durationMinutes: 10 }, f1Token);
    console.log("Auction start response:", auction.success ? "Success" : "Failed", auction.message || '');
    if (auction.success) {
      console.log("Checking if Buyer can bid (POST /auctions/:id/bid)...");
      const bid = await request('POST', `/auctions/${auction.data._id}/bid`, { amount: 2200 }, b1Token);
      console.log("Bid response:", typeof bid === 'string' && bid.includes('Cannot POST') ? "ENDPOINT NOT BUILT (404)" : JSON.stringify(bid));
    }
  } else {
    console.log("Failed to create crop for auction test.", crop);
  }

  // 2. Auto Logistics Pooling Check
  console.log("\n--- 2. Logistics Pooling Test ---");
  const poolRes = await request('GET', '/deliveries/pool', null, f1Token);
  console.log("Pool Response received:", poolRes.success ? `Success (${poolRes.data.length} pools)` : "Failed");

  // 4. AgriCredit Ledger OTP Cash Payment Check
  console.log("\n--- 4. AgriCredit Ledger OTP Test ---");
  console.log("Checking if endpoint to mark cash payment exists...");
  // Try to create an order
  const orderRes = await request('POST', '/orders', { cropId, farmerId: f1.data?.user?._id, quantity: 10, totalAmount: 20000, paymentStatus: 'pending' }, b1Token);
  if (orderRes.success) {
    orderId = orderRes.data._id;
    console.log("Order created. Trying to pay via cash (trigger OTP)...");
    const payRes = await request('POST', `/orders/${orderId}/pay-cash`, {}, b1Token);
    console.log("Pay cash response:", typeof payRes === 'string' && payRes.includes('Cannot POST') ? "ENDPOINT NOT BUILT (404)" : JSON.stringify(payRes));
    
    if (payRes.success) {
      // Get OTP
      const otpRes = await request('GET', `/orders/debug/otp/${orderId}`, null, b1Token);
      console.log("Retrieved OTP:", otpRes.otp);
      
      // Verify OTP
      const verifyRes = await request('POST', `/orders/${orderId}/verify-cash`, { otp: otpRes.otp }, f1Token);
      console.log("Verify cash response:", JSON.stringify(verifyRes));
      
      // Check credit ledger update
      const creditRes = await request('GET', '/credit', null, f1Token);
      console.log("Credit Ledger state:", JSON.stringify(creditRes));
    }
  } else {
    console.log("Order creation failed or not built:", orderRes.message || 'Cannot POST');
  }

}

runAudit().catch(console.error);
