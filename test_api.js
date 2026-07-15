

const API = 'http://127.0.0.1:5000/api';
let token = '';

async function runTest() {
  console.log("=== STARTING API TEST ===");
  try {
    // 1. Signup Farmer to get token
    console.log("1. Signing up Farmer...");
    const fRes = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `ApiTest_${Date.now()}`,
        phone: `${Date.now()}`.slice(0, 10),
        password: 'password123',
        role: 'farmer',
        location: { coordinates: [73.8567, 18.5204] } // Pune
      })
    });
    const fData = await fRes.json();
    token = fData.data.token;
    
    // 2. Test Weather API
    console.log("\n2. Testing Weather API...");
    const wRes = await fetch(`${API}/weather/farmer`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const wData = await wRes.json();
    console.log("Weather API Response:");
    console.log(JSON.stringify(wData, null, 2));

    // 3. Test AI API
    console.log("\n3. Testing AI Chat API...");
    const aiRes = await fetch(`${API}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ prompt: 'What is the weather like at my farm?', language: 'en' })
    });
    const aiData = await aiRes.json();
    console.log("AI Chat API Response:");
    console.log(JSON.stringify(aiData, null, 2));

  } catch (err) {
    console.error("Test failed:", err);
  }
}

runTest();
