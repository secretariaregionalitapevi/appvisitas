require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testComuns() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = "visitas_comuns";

  console.log(`Checking table: ${table}`);
  console.log(`URL: ${supabaseUrl}`);

  try {
    const url = new URL(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}?select=*`);
    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Error ${response.status}: ${text}`);
      return;
    }

    const data = await response.json();
    console.log(`Success! Found ${data.length} records.`);
    if (data.length > 0) {
      console.log('Sample:', data[0]);
    } else {
      console.log('Table is EMPTY. Did you populate it?');
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testComuns();
