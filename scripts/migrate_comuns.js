require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function migrateComuns() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    // 1. Pegar da antiga 'comum'
    console.log('Reading from legacy table: comum...');
    const urlOld = new URL(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/comum?select=*`);
    const resOld = await fetch(urlOld, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      }
    });

    if (!resOld.ok) {
      throw new Error(`Error reading legacy table: ${await resOld.text()}`);
    }

    const legacyData = await resOld.json();
    console.log(`Found ${legacyData.length} records. Migrating to 'visitas_comuns'...`);

    // 2. Mapear para o novo formato
    const newData = legacyData.map(item => ({
      comum: item.comum,
      cidade: item.cidade || item.municipio || "Itapevi"
    }));

    // 3. Inserir na nova 'visitas_comuns'
    const urlNew = new URL(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/visitas_comuns`);
    const resNew = await fetch(urlNew, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify(newData)
    });

    if (!resNew.ok) {
      const err = await resNew.text();
      console.error('Error inserting into new table:', err);
    } else {
      console.log('Migration SUCCESSFUL!');
    }

  } catch (err) {
    console.error('Migration FAILED:', err);
  }
}

migrateComuns();
