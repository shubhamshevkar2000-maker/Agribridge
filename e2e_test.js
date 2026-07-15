const { createClient } = require('redis');

const API = 'http://127.0.0.1:5000/api';
let farmerToken = '';
let buyerToken = '';
let farmerId = '';
let buyerId = '';
let cropId = '';
let orderId = '';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log("=== STARTING END-TO-END TEST ===");
  try {
    // 1. Signup Farmer
    console.log("1. Signing up Farmer...");
    const fRes = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Farmer_${Date.now()}`,
        phone: `${Date.now()}`.slice(0, 10),
        password: 'password123',
        role: 'farmer',
        location: { coordinates: [73.8567, 18.5204] } // Pune
      })
    });
    const fData = await fRes.json();
    farmerToken = fData.data.token;
    farmerId = fData.data._id;
    console.log("   Farmer created:", farmerId, "Coordinates: [73.8567, 18.5204]");

    // 2. Signup Buyer
    console.log("2. Signing up Buyer...");
    const bRes = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Buyer_${Date.now()}`,
        phone: `${Date.now()+1}`.slice(0, 10),
        password: 'password123',
        role: 'buyer',
        location: { coordinates: [72.8777, 19.0760] } // Mumbai
      })
    });
    const bData = await bRes.json();
    buyerToken = bData.data.token;
    buyerId = bData.data._id;
    console.log("   Buyer created:", buyerId);

    // 3. Farmer Lists Crop
    console.log("3. Farmer listing crop...");
    const cRes = await fetch(`${API}/crops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${farmerToken}` },
      body: JSON.stringify({
        name: 'Organic Wheat',
        category: 'Grains',
        quantity: 500,
        unit: 'Quintals',
        pricePerUnit: 2500,
        isOrganic: true
      })
    });
    const cData = await cRes.json();
    cropId = cData.data._id;
    console.log("   Crop listed:", cropId);

    // 4. Buyer Creates Order
    console.log("4. Buyer buying crop...");
    const oRes = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buyerToken}` },
      body: JSON.stringify({ cropId, quantity: 100 })
    });
    const oData = await oRes.json();
    orderId = oData.data._id;
    console.log("   Order created:", orderId, "Status:", oData.data.paymentStatus);

    // 5. Buyer Pays via Cash (Triggers OTP)
    console.log("5. Buyer initiating cash payment (triggering OTP)...");
    const pRes = await fetch(`${API}/orders/${orderId}/pay-cash`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    });
    const pData = await pRes.json();
    console.log("   Pay cash response:", pData);

    // 6. Get OTP from Debug Route
    console.log("6. Retrieving OTP from Debug route...");
    const otpRes = await fetch(`${API}/orders/debug/otp/${orderId}`);
    const otpData = await otpRes.json();
    const otp = otpData.otp;
    console.log("   Intercepted OTP:", otp);

    // 7. Farmer verifies OTP
    console.log("7. Farmer verifying OTP...");
    const vRes = await fetch(`${API}/orders/${orderId}/verify-cash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${farmerToken}` },
      body: JSON.stringify({ otp })
    });
    const vData = await vRes.json();
    console.log("   Verify OTP response:", vData);

    // 8. Verify Transaction and CreditLedger
    console.log("8. Verifying MongoDB updates (via direct query or API)...");
    const checkOrderRes = await fetch(`${API}/orders`, {
      headers: { 'Authorization': `Bearer ${farmerToken}` }
    });
    const checkOrderData = await checkOrderRes.json();
    console.log("   Order paymentStatus is now:", checkOrderData.data.find(o => o._id === orderId)?.paymentStatus);
    
    // 9. Logistics Pooling Engine Test
    console.log("\n=== TESTING LOGISTICS POOLING ===");
    console.log("Creating second farmer near Pune ([73.86, 18.53])...");
    const f2Res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Farmer2_${Date.now()}`,
        phone: `${Date.now()+2}`.slice(0, 10),
        password: 'password123',
        role: 'farmer',
        location: { coordinates: [73.86, 18.53] } // Close to Farmer 1
      })
    });
    const f2Data = await f2Res.json();
    const farmer2Token = f2Data.data.token;
    
    // Farmer 2 lists crop
    const c2Res = await fetch(`${API}/crops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${farmer2Token}` },
      body: JSON.stringify({
        name: 'Organic Tomatoes',
        category: 'Vegetables',
        quantity: 200,
        unit: 'Quintals',
        pricePerUnit: 1500,
        isOrganic: true
      })
    });
    const c2Data = await c2Res.json();
    
    // Buyer buys from Farmer 2
    const o2Res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buyerToken}` },
      body: JSON.stringify({ cropId: c2Data.data._id, quantity: 150 })
    });
    const o2Data = await o2Res.json();
    
    // Both orders are now 'pending' delivery (and one is 'completed' payment, one is 'pending' payment but delivery is pending for both)
    console.log("Fetching Delivery Pools...");
    const poolRes = await fetch(`${API}/deliveries/pool`, {
      headers: { 'Authorization': `Bearer ${farmerToken}` } // Admin/Logistics or anyone
    });
    const poolData = await poolRes.json();
    console.log("   Pools Data:", JSON.stringify(poolData.data, null, 2));
    
    console.log("=== END-TO-END TEST COMPLETE ===");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

runTest();
