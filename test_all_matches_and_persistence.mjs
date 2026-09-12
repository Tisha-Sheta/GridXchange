import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000/api';

async function req(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(`API Error ${res.status} on ${endpoint}: ${JSON.stringify(json)}`);
  }
  return json.data !== undefined ? json.data : json;
}

async function runTests() {
  console.log('=== TEST 1: Register New Prosumer (Aarav Rooftop Solar) ===');
  const uniqueEmail = `aarav_${Date.now()}@gridxchange.io`;
  const regRes = await req('/auth/register', 'POST', {
    name: 'Aarav Patel (Rooftop Solar)',
    email: uniqueEmail,
    password: 'password123',
    phone: '+91 99887 76655',
    location: 'Aarav Villa, Zone A',
    role: 'prosumer',
    solar_capacity: 8.5,
  });
  const newProsumerToken = regRes.token;
  const newProsumerUser = regRes.user;
  console.log('Registered Prosumer:', newProsumerUser.name, '| ID:', newProsumerUser.id);

  console.log('\n=== TEST 2: New Prosumer Creates a Valid Energy Listing ===');
  const newListing = await req('/listings', 'POST', {
    quantity: 7.5,
    price: 6.90,
    start_time: '14:00',
    end_time: '15:00',
    grid_zone_id: 'zone_a',
  }, newProsumerToken);
  console.log('Created Listing ID:', newListing.id, '| Quantity:', newListing.quantity, 'kWh | Price: ₹', newListing.price);

  console.log('\n=== TEST 3: Login as Consumer C001 & Find Energy ===');
  const c001Login = await req('/auth/demo-login', 'POST', { identifier: 'C001' });
  const c001Token = c001Login.token;
  console.log('Logged in as:', c001Login.user.name, '| Role:', c001Login.user.role);

  console.log('\n=== TEST 4: Create Requirement & Verify ALL Prosumer Matches (Ranked Best First) ===');
  const matchRes = await req('/requirements', 'POST', {
    quantity: 5.0,
    max_price: 8.0,
    start_time: '14:00',
    end_time: '15:00',
    preferred_zone: 'Zone A',
  }, c001Token);

  const matches = matchRes.matches;
  console.log(`Total Matches Returned: ${matches.length}`);
  
  if (matches.length < 2) {
    throw new Error(`Expected multiple prosumer matches, but received ${matches.length}`);
  }

  // Print all matches in ranked order
  matches.forEach((m, idx) => {
    const pName = m.prosumer?.user?.name || m.listing?.prosumer_id;
    const price = m.pricing_breakdown?.final_price || m.listing?.price;
    console.log(`  [Rank #${idx + 1}] Score: ${m.match_score}% | Producer: ${pName} | Price: ₹${price}/kWh | Surplus: ${m.listing?.quantity} kWh`);
  });

  // Verify descending score order
  for (let i = 0; i < matches.length - 1; i++) {
    if (matches[i].match_score < matches[i + 1].match_score) {
      throw new Error(`Matches are not sorted descending: Rank #${i + 1} (${matches[i].match_score}%) < Rank #${i + 2} (${matches[i + 1].match_score}%)`);
    }
  }
  console.log('✓ Matches are correctly ranked in descending Smart Match Score order (Best match at top)');

  // Verify that the newly registered prosumer is included in the matches
  const foundNewProsumer = matches.find(m => m.prosumer?.user?.email === uniqueEmail);
  if (!foundNewProsumer) {
    throw new Error('Newly registered prosumer listing was NOT found in matches!');
  }
  console.log('✓ Newly registered prosumer is included in Find Energy matches:', foundNewProsumer.prosumer?.user?.name);

  console.log('\n=== TEST 5: Confirm Trade with the Newly Registered Prosumer ===');
  const confirmedTrade = await req('/trades/confirm', 'POST', {
    listing_id: foundNewProsumer.listing_id,
    requirement_id: matchRes.requirement.id,
    quantity: 5.0,
    price: foundNewProsumer.pricing_breakdown?.final_price || 6.90,
  }, c001Token);
  console.log('Trade Confirmed ID:', confirmedTrade.id, '| Buyer:', confirmedTrade.buyer_id, '| Seller:', confirmedTrade.seller_id);

  console.log('\n=== TEST 6: Settle Trade & Simulate Delivery ===');
  const settleRes = await req(`/trades/${confirmedTrade.id}/simulate-delivery`, 'POST', null, c001Token);
  console.log('Settlement Message:', settleRes.message, '| Status:', settleRes.trade.status);
  if (settleRes.trade.status !== 'Settled') throw new Error('Trade status must be Settled');

  console.log('\n=== TEST 7: Check Disk Persistence in server/data/database.json ===');
  const dbFilePath = path.resolve(process.cwd(), 'server', 'data', 'database.json');
  if (!fs.existsSync(dbFilePath)) {
    throw new Error('database.json does not exist on disk!');
  }
  const dbData = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
  const userInFile = dbData.users.find(u => u.email === uniqueEmail);
  const tradeInFile = dbData.trades.find(t => t.id === confirmedTrade.id);
  const listingInFile = dbData.energy_listings.find(l => l.id === newListing.id);

  console.log('Found user in persisted database.json:', userInFile?.name);
  console.log('Found listing in persisted database.json:', listingInFile?.id);
  console.log('Found trade in persisted database.json:', tradeInFile?.id, '| Status:', tradeInFile?.status);

  if (!userInFile || !tradeInFile || !listingInFile) {
    throw new Error('Data persistence check failed: some records were not saved to database.json');
  }

  console.log('\n=== ALL PERSISTENCE, MULTI-PROSUMER, AND BEST MATCH RANKING TESTS PASSED! ===\n');
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
