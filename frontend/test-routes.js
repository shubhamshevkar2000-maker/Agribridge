const routes = [
  "/", "/login", "/signup", "/farmer", "/buyer", 
  "/farmer/marketplace", "/farmer/inventory", "/farmer/auctions", 
  "/farmer/credit", "/farmer/loans", "/farmer/deliveries", "/farmer/ai"
];

async function test() {
  let passed = true;
  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3000${route}`);
      if (!res.ok) {
        console.error(`❌ ${route} failed with status ${res.status}`);
        passed = false;
      } else {
        console.log(`✅ ${route} passed`);
      }
    } catch (err) {
      console.error(`❌ ${route} failed: ${err.message}`);
      passed = false;
    }
  }
  if (!passed) process.exit(1);
}
test();
