const { io } = require('socket.io-client');
const fetch = require('node-fetch');

async function waitAndFetch(url, options, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (e) {
      if (e.code === 'ECONNREFUSED') {
        console.log('Server not ready, waiting 2s...');
        await new Promise(r => setTimeout(r, 2000));
      } else {
        throw e;
      }
    }
  }
  throw new Error('Server never became ready');
}

async function runTest() {
  console.log('--- STARTING CONCURRENT BID TEST ---');
  try {
    // 1. Login Farmer
    const farmerRes = await waitAndFetch('http://127.0.0.1:5000/api/auth/login', { 
      method: 'POST', headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ emailOrPhone: 'test1@example.com', password: 'password123' }) 
    });
    const farmerToken = (await farmerRes.json()).data.token;

    // 2. Create Crop
    const cropRes = await fetch('http://127.0.0.1:5000/api/crops', { 
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + farmerToken },
      body: JSON.stringify({ name: 'Auction Wheat', category: 'Grains', quantity: 50, unit: 'Quintals', pricePerUnit: 2000 })
    });
    const cropId = (await cropRes.json()).data._id;
    console.log('Created Crop:', cropId);

    // 3. Create Auction
    const auctionRes = await fetch('http://127.0.0.1:5000/api/auctions', { 
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + farmerToken },
      body: JSON.stringify({ cropId, startingBid: 2100, durationMinutes: 10 })
    });
    const auctionId = (await auctionRes.json()).data._id;
    console.log('Created Auction:', auctionId);

    // 4. Setup 2 Socket Clients (Mock Buyers)
    const socket1 = io('http://127.0.0.1:5000');
    const socket2 = io('http://127.0.0.1:5000');
    
    await new Promise(r => setTimeout(r, 1000)); // wait for connect
    socket1.emit('auction:join', auctionId);
    socket2.emit('auction:join', auctionId);

    const onUpdate = (socketName) => (data) => {
      console.log(`[${socketName}] Received Update - Highest Bid: ${data.highestBid} by ${data.highestBidder}`);
    };

    socket1.on('auction:update', onUpdate('Socket1'));
    socket2.on('auction:update', onUpdate('Socket2'));
    socket1.on('auction:error', (err) => console.log('[Socket1] Error:', err.message));
    socket2.on('auction:error', (err) => console.log('[Socket2] Error:', err.message));

    await new Promise(r => setTimeout(r, 1000)); // wait for join

    console.log('>>> FIRING CONCURRENT BIDS: 2500 from Buyer A, 2500 from Buyer B <<<');
    // Both try to bid 2500 simultaneously! Only one should win the atomic lock.
    socket1.emit('auction:bid', { auctionId, amount: 2500, userId: 'buyer_A_id' });
    socket2.emit('auction:bid', { auctionId, amount: 2500, userId: 'buyer_B_id' });

    await new Promise(r => setTimeout(r, 2000)); // wait for responses

    console.log('>>> FIRING HIGHER BID: 2600 from Buyer B <<<');
    socket2.emit('auction:bid', { auctionId, amount: 2600, userId: 'buyer_B_id' });

    await new Promise(r => setTimeout(r, 2000)); // wait for responses

    socket1.close();
    socket2.close();
    console.log('--- TEST COMPLETE ---');
  } catch (err) {
    console.error(err);
  }
}
runTest();
