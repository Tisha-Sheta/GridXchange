import fs from 'fs';

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('=== STEP 1: VERIFY PERSISTENT DATABASE INITIAL STATE ===');
  const initialDbRaw = fs.readFileSync('server/data/database.json', 'utf-8');
  const initialDb = JSON.parse(initialDbRaw);
  console.log(`Initial DB has ${initialDb.users.length} users, ${initialDb.energy_listings.length} listings.`);

  // 1. Register a new test prosumer: SolarPro Alpha (P_TEST_101)
  console.log('\n=== STEP 2: REGISTER NEW PROSUMER P_TEST_101 ===');
  const regProsumerRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Vikram Sarabhai Solar (P101)',
      email: `p101_${Date.now()}@gridxchange.io`,
      password: 'password123',
      phone: '+91 99887 76655',
      location: 'Sarabhai Estate, Vastrapur, Ahmedabad',
      city: 'Ahmedabad',
      locality: 'Vastrapur',
      latitude: 23.0360,
      longitude: 72.5280,
      role: 'prosumer',
      solar_capacity: 12.0,
    }),
  });
  const regProsumerData = await regProsumerRes.json();
  if (!regProsumerData.success) {
    throw new Error(`Prosumer registration failed: ${JSON.stringify(regProsumerData)}`);
  }
  const prosumerUser = regProsumerData.data.user;
  const prosumerToken = regProsumerData.data.token;
  console.log(`Prosumer registered successfully: ${prosumerUser.id} (${prosumerUser.name}) | Grid Zone: ${prosumerUser.grid_zone} | Coords: (${prosumerUser.latitude}, ${prosumerUser.longitude})`);

  // Verify Prosumer was actually inserted into database.json with numeric coords and grid zone
  const dbAfterReg = JSON.parse(fs.readFileSync('server/data/database.json', 'utf-8'));
  const foundUserInDb = dbAfterReg.users.find((u) => u.id === prosumerUser.id);
  if (!foundUserInDb) {
    throw new Error('FAILED: Registered prosumer NOT found in database.json!');
  }
  if (typeof foundUserInDb.latitude !== 'number' || typeof foundUserInDb.longitude !== 'number') {
    throw new Error('FAILED: Latitude and Longitude must be stored as numeric values in database.json!');
  }
  if (!foundUserInDb.grid_zone) {
    throw new Error('FAILED: Grid Zone must be automatically assigned and stored in database.json!');
  }
  console.log(`VERIFIED: User ${prosumerUser.id} is persisted on disk with numeric coords (${foundUserInDb.latitude}, ${foundUserInDb.longitude}) and auto-assigned grid zone ${foundUserInDb.grid_zone}.`);

  // 2. Prosumer Creates Energy Listing
  console.log('\n=== STEP 3: PROSUMER CREATES ENERGY LISTING ===');
  const createListingRes = await fetch(`${BASE_URL}/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${prosumerToken}`,
    },
    body: JSON.stringify({
      quantity: 7.5,
      price: 6.8,
      start_time: '14:00',
      end_time: '15:00',
      grid_zone_id: 'zone_a',
    }),
  });
  const createListingData = await createListingRes.json();
  if (!createListingData.success) {
    throw new Error(`Listing creation failed: ${JSON.stringify(createListingData)}`);
  }
  const createdListing = createListingData.data;
  console.log(`Listing created: ID ${createdListing.id}, prosumer_id: ${createdListing.prosumer_id}, price: ₹${createdListing.price}/kWh, qty: ${createdListing.quantity} kWh`);

  // Verify Listing was actually inserted into database.json
  const dbAfterListing = JSON.parse(fs.readFileSync('server/data/database.json', 'utf-8'));
  const foundListingInDb = dbAfterListing.energy_listings.find((l) => l.id === createdListing.id);
  if (!foundListingInDb) {
    throw new Error('FAILED: Created listing NOT found in database.json!');
  }
  console.log(`VERIFIED: Listing ${createdListing.id} is persisted on disk with prosumer_id: ${foundListingInDb.prosumer_id}`);

  // 3. Register a new Consumer: Ananya Test (C_TEST_101)
  console.log('\n=== STEP 4: REGISTER NEW CONSUMER C_TEST_101 ===');
  const regConsumerRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Kavita Iyer (C101)',
      email: `c101_${Date.now()}@gridxchange.io`,
      password: 'password123',
      phone: '+91 91234 56789',
      location: 'Palm Meadows, Bodakdev, Ahmedabad',
      city: 'Ahmedabad',
      locality: 'Bodakdev',
      latitude: 23.0390,
      longitude: 72.5130,
      role: 'consumer',
    }),
  });
  const regConsumerData = await regConsumerRes.json();
  if (!regConsumerData.success) {
    throw new Error(`Consumer registration failed: ${JSON.stringify(regConsumerData)}`);
  }
  const consumerUser = regConsumerData.data.user;
  const consumerToken = regConsumerData.data.token;
  console.log(`Consumer registered successfully: ${consumerUser.id} (${consumerUser.name}) | Grid Zone: ${consumerUser.grid_zone} | Coords: (${consumerUser.latitude}, ${consumerUser.longitude})`);

  // Verify Consumer was inserted into database.json with numeric coordinates
  const dbAfterConsumer = JSON.parse(fs.readFileSync('server/data/database.json', 'utf-8'));
  const foundConsumerInDb = dbAfterConsumer.users.find((u) => u.id === consumerUser.id);
  if (!foundConsumerInDb) {
    throw new Error('FAILED: Registered consumer NOT found in database.json!');
  }
  if (typeof foundConsumerInDb.latitude !== 'number' || typeof foundConsumerInDb.longitude !== 'number') {
    throw new Error('FAILED: Consumer coordinates must be stored as numeric values in database.json!');
  }
  console.log(`VERIFIED: Consumer ${consumerUser.id} is persisted on disk in database.json with numeric coords (${foundConsumerInDb.latitude}, ${foundConsumerInDb.longitude}).`);

  // 4. Consumer Creates Requirement & Finds Energy
  console.log('\n=== STEP 5: CONSUMER FINDS ENERGY (MATCHING SYSTEM) ===');
  const reqRes = await fetch(`${BASE_URL}/requirements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${consumerToken}`,
    },
    body: JSON.stringify({
      quantity: 5.0,
      max_price: 8.5,
      start_time: '14:00',
      end_time: '15:00',
      preferred_zone: 'Zone A',
    }),
  });
  const reqData = await reqRes.json();
  if (!reqData.success) {
    throw new Error(`Find Energy requirement failed: ${JSON.stringify(reqData)}`);
  }

  const { requirement, matches } = reqData.data;
  console.log(`Requirement created: ${requirement.id}, found ${matches.length} matching prosumers:`);
  
  if (matches.length < 3) {
    throw new Error(`Expected at least 3 matches (P001, P002, P003, etc.), got ${matches.length}`);
  }

  let prevScore = 101;
  matches.forEach((m, idx) => {
    const pName = m.prosumer?.user?.name || m.prosumer?.id;
    const loc = m.prosumer?.user?.location || 'Unknown';
    const finalPrice = m.pricing_breakdown?.final_price;
    console.log(`  Match #${idx + 1}: Score ${m.match_score}% | Seller: ${pName} | Loc: ${loc} | Price: ₹${finalPrice}/kWh | Surplus: ${m.listing?.quantity} kWh`);
    
    // Check score ordering descending
    if (m.match_score > prevScore) {
      throw new Error(`FAILED: Matches not in descending score order! Match #${idx} score ${m.match_score} > previous ${prevScore}`);
    }
    prevScore = m.match_score;
  });

  console.log(`\nBEST MATCH (#1): ${matches[0].prosumer?.user?.name} with ${matches[0].match_score}% Smart Match Score.`);

  // 5. Confirm Trade with Best Match
  console.log('\n=== STEP 6: CONSUMER CONFIRMS TRADE WITH BEST MATCH ===');
  const confirmRes = await fetch(`${BASE_URL}/trades/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${consumerToken}`,
    },
    body: JSON.stringify({
      listing_id: matches[0].listing_id,
      requirement_id: requirement.id,
      quantity: 5.0,
      price: matches[0].pricing_breakdown?.final_price || 7.5,
    }),
  });
  const confirmData = await confirmRes.json();
  if (!confirmData.success) {
    throw new Error(`Trade confirmation failed: ${JSON.stringify(confirmData)}`);
  }
  const trade = confirmData.data;
  console.log(`Trade confirmed: ID ${trade.id}, status: ${trade.status}, total: ₹${trade.total_amount}`);

  // 6. Settle / Simulate Delivery
  console.log('\n=== STEP 7: SIMULATE DELIVERY AND SETTLEMENT ===');
  const simRes = await fetch(`${BASE_URL}/trades/${trade.id}/simulate-delivery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${consumerToken}`,
    },
  });
  const simData = await simRes.json();
  if (!simData.success) {
    throw new Error(`Delivery simulation failed: ${JSON.stringify(simData)}`);
  }
  console.log(`Delivery simulation successful: ${simData.data.message}`);
  const stlId = simData.data.settlements && simData.data.settlements.length > 0 ? simData.data.settlements[0].id : 'N/A';
  console.log(`Trade status updated to: ${simData.data.trade.status}, settlement ID: ${stlId}`);

  // 7. Verify all state persisted to disk
  console.log('\n=== STEP 8: FINAL DISK PERSISTENCE VERIFICATION ===');
  const finalDb = JSON.parse(fs.readFileSync('server/data/database.json', 'utf-8'));
  const foundTrade = finalDb.trades.find((t) => t.id === trade.id);
  const foundSettlement = finalDb.settlements.find((s) => s.trade_id === trade.id);
  if (!foundTrade || foundTrade.status !== 'Settled') {
    throw new Error(`Trade ${trade.id} not found or not Settled in database.json!`);
  }
  if (!foundSettlement || foundSettlement.settlement_status !== 'Completed') {
    throw new Error(`Settlement for trade ${trade.id} not found in database.json!`);
  }
  console.log(`VERIFIED: Trade ${trade.id} (status: Settled) and Settlement ${foundSettlement.id} (status: Completed) are permanently saved in database.json.`);

  console.log('\n>>> ALL 8 INTEGRATION AND PERSISTENCE TESTS PASSED CLEANLY! <<<');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
