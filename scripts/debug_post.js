const payload = {
  referencia_mes: 4,
  referencia_ano: 2026,
  gvi: 10,
  gvm: 5,
  gvmu: 2,
  rf: 8,
  re: 3,
  municipio: 'ITAPEVI',
  comum: 'BR-22-0673 - VILA DOUTOR CARDOSO',
  identificacao: 'debug@test.com',
  ip: '127.0.0.1',
  os: 'debug',
  browser: 'debug'
};

console.log('Sending debug POST to /api/visitas...');

async function run() {
  try {
    const response = await fetch('http://localhost:3000/api/visitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const status = response.status;
    const body = await response.json();

    console.log(`Status: ${status}`);
    console.log('Body:', JSON.stringify(body, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
