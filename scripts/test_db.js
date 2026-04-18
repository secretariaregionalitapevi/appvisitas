const SUPABASE_URL = "https://sqamxlhfazulrisiptud.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxYW14bGhmYXp1bHJpc2lwdHVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM3NTg4NCwiZXhwIjoyMDgyOTUxODg0fQ.w92yMKGGh5-ewRq0q6Pdl8TstzGlx0sGms1FCRveDYc";

async function test() {
  const url = `${SUPABASE_URL}/rest/v1/comum?select=*&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  const data = await res.json();
  console.log("Sample row from 'comum':", JSON.stringify(data[0], null, 2));
  
  const resVisits = await fetch(`${SUPABASE_URL}/rest/v1/visits?select=*&limit=1`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  const dataVisits = await resVisits.json();
  console.log("Sample row from 'visits':", JSON.stringify(dataVisits[0], null, 2));
}

test();
