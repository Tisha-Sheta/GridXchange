import fetch from 'node-fetch';

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
  console.log('=== 1. Testing Explicit Login as C001 (Consumer) ===');
  const c001Login = await req('/auth/demo-login', 'POST', { identifier: 'C001' });
  const c001Token = c001Login.token;
  console.log('Logged in as:', c001Login.user.name, '| Role:', c001Login.user.role, '| ID:', c001Login.user.id);
  if (c001Login.user.role !== 'consumer') throw new Error('C001 role mismatch!');

  console.log('\n=== 2. Verify C001 Profile & Session Persistence ===');
  const c001Profile = await req('/users/profile', 'GET', null, c001Token);
  console.log('Verified Profile:', c001Profile.name, '| Role:', c001Profile.role);
  if (c001Profile.role !== 'consumer') throw new Error('Profile role mismatch!');

  console.log('\n=== 3. C001 Creates Energy Requirement (5 kWh @ ₹8/kWh) ===');
  const reqRes = await req('/requirements', 'POST', {
    quantity: 5.0,
    max_price: 8.0,
    start_time: '14:00',
    end_time: '15:00',
    preferred_zone: 'Zone A'
  }, c001Token);
  console.log('Created Requirement ID:', reqRes.requirement.id, '| Matches Found:', reqRes.matches.length);

  const listings = await req('/listings?status=Available', 'GET', null, c001Token);
  console.log('Available listings count:', listings.length);
  const targetListing = listings.find((l) => l.prosumer_id === 'p_001') || listings[0] || { id: 'lst_001', price: 7.5, quantity: 5.0, prosumer_id: 'p_001' };

  console.log('\n=== 5. C001 Confirms Trade with Prosumer P001 ===');
  const confirmedTrade = await req('/trades/confirm', 'POST', {
    listing_id: targetListing.id,
    requirement_id: reqRes.requirement.id,
    quantity: 5.0,
    price: targetListing.price || 7.5,
  }, c001Token);
  console.log('Confirmed Trade ID:', confirmedTrade.id, '| Status:', confirmedTrade.status, '| Buyer:', confirmedTrade.buyer_id, '| Seller:', confirmedTrade.seller_id);
  if (confirmedTrade.status !== 'Scheduled') throw new Error('Trade status must be Scheduled initially');

  console.log('\n=== 6. Verify Trade Appears in C001 Trades ===');
  const c001Trades = await req('/trades', 'GET', null, c001Token);
  const activeTrade = c001Trades.find(t => t.id === confirmedTrade.id);
  console.log('Found Active Trade in C001 list:', activeTrade?.id, '| Status:', activeTrade?.status);
  if (!activeTrade) throw new Error('Trade not found in C001 active trades list');

  console.log('\n=== 7. Simulate Delivery & Settle Trade ===');
  const settleRes = await req(`/trades/${confirmedTrade.id}/simulate-delivery`, 'POST', null, c001Token);
  console.log('Settlement Message:', settleRes.message, '| Settled Status:', settleRes.trade.status);
  if (settleRes.trade.status !== 'Settled') throw new Error('Trade status must be Settled');

  console.log('\n=== 8. Verify C001 Profile & Savings Updated ===');
  const c001UpdatedProfile = await req('/users/profile', 'GET', null, c001Token);
  console.log('Updated C001 Energy Purchased:', c001UpdatedProfile.roleData?.total_energy_purchased, 'kWh | Savings: ₹', c001UpdatedProfile.roleData?.total_savings);

  console.log('\n=== 9. Prosumer P001 Flow: Login ===');
  const p001Login = await req('/auth/demo-login', 'POST', { identifier: 'P001' });
  const p001Token = p001Login.token;
  console.log('Logged in as:', p001Login.user.name, '| Role:', p001Login.user.role, '| ID:', p001Login.user.id);
  if (p001Login.user.role !== 'prosumer') throw new Error('P001 role mismatch!');

  console.log('\n=== 10. Check P001 Trades (Includes the Trade with C001) ===');
  const p001Trades = await req('/trades', 'GET', null, p001Token);
  const p001TradeFound = p001Trades.find(t => t.id === confirmedTrade.id);
  console.log('Found trade in P001 trades:', p001TradeFound?.id, '| Buyer:', p001TradeFound?.buyer?.user?.name, '| Status:', p001TradeFound?.status);
  if (!p001TradeFound) throw new Error('Trade not associated with seller P001');

  console.log('\n=== 11. Check P001 Dashboard & Earnings ===');
  const p001Dash = await req('/prosumer/dashboard', 'GET', null, p001Token);
  console.log('P001 Total Energy Sold:', p001Dash.stats.total_energy_sold, 'kWh | Total Earnings: ₹', p001Dash.stats.total_earnings);

  console.log('\n=== 12. P001 Creates New Solar Listing ===');
  const newListing = await req('/listings', 'POST', {
    quantity: 6.0,
    price: 7.20,
    start_time: '14:00',
    end_time: '15:00',
  }, p001Token);
  console.log('Created Listing ID:', newListing.id, '| Qty:', newListing.quantity, '| Price: ₹', newListing.price);

  console.log('\n=== ALL USER SESSION & INSTANT SETTLEMENT TESTS PASSED! ===\n');
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
