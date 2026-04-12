import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ypcbqtaqphqtpxcpuxwn.supabase.co';
const supabaseKey = 'sb_publishable_X1xz9cBc6S3akJe44R4PwQ_gSKst19l';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log("Testing Supabase Connection...");
  
  // Test 1: Select users
  console.log("\n1. Testing 'users' table...");
  const { data: users, error: usersErr } = await supabase.from('users').select('*').limit(1);
  if (usersErr) console.error("Error users:", usersErr.message);
  else console.log("Success users:", users ? users.length : 0, "rows found.");

  // Test 2: Select pre_authorized_users
  console.log("\n2. Testing 'pre_authorized_users' table...");
  const { data: preAuth, error: preAuthErr } = await supabase.from('pre_authorized_users').select('*').limit(1);
  if (preAuthErr) console.error("Error pre_authorized_users:", preAuthErr.message);
  else console.log("Success pre_authorized_users:", preAuth ? preAuth.length : 0, "rows found.");

  // Test 3: Select categories
  console.log("\n3. Testing 'categories' table...");
  const { data: cat, error: catErr } = await supabase.from('categories').select('*').limit(1);
  if (catErr) console.error("Error categories:", catErr.message);
  else console.log("Success categories:", cat ? cat.length : 0, "rows found.");

  // Test 4: Insert test category
  console.log("\n4. Testing Insert into 'categories'...");
  const testName = 'TestCategory-' + Date.now();
  const { data: insCat, error: insErr } = await supabase.from('categories').insert({ name: testName }).select();
  if (insErr) console.error("Error inserting category:", insErr.message);
  else {
    console.log("Success inserting category:", insCat[0].name);
    // Cleanup
    await supabase.from('categories').delete().eq('id', insCat[0].id);
  }

  // Test 5: Insert test pre_authorized_user
  console.log("\n5. Testing Insert into 'pre_authorized_users'...");
  const testEmail = 'test-' + Date.now() + '@example.com';
  const { data: insAuth, error: insAuthErr } = await supabase.from('pre_authorized_users').insert({ 
    email: testEmail, 
    role: 'Consultant', 
    organization: 'Ministère de la Défense' 
  }).select();
  if (insAuthErr) console.error("Error inserting pre_authorized_user:", insAuthErr.message);
  else {
    console.log("Success inserting pre_authorized_user:", insAuth[0].email);
    // Cleanup
    await supabase.from('pre_authorized_users').delete().eq('id', insAuth[0].id);
  }
}

testSupabase();
