import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ypcbqtaqphqtpxcpuxwn.supabase.co';
const supabaseKey = 'sb_publishable_X1xz9cBc6S3akJe44R4PwQ_gSKst19l';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMovement() {
  console.log("Testing Movement Insert...");
  
  // get an item
  const { data: items } = await supabase.from('items').select('*').limit(1);
  if (!items || items.length === 0) {
     console.log("No items found to create a movement for.");
     return;
  }
  const item = items[0];
  console.log("Found item:", item.id);

  const newMovement = {
    itemId: item.id,
    itemName: item.name,
    itemType: item.category,
    quantity: 1,
    status: 'En transit',
    departureDate: new Date().toISOString().split('T')[0],
    originUnit: 'Test Origine',
    destinationUnit: 'Test Destination',
    transportMethod: 'Test Transport'
  };

  const { data, error } = await supabase.from('movements').insert(newMovement);
  
  if (error) {
    console.error("EXACT SUPABASE ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("SUCCESS!");
  }
}

testMovement();
