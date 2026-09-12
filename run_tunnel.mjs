import localtunnel from 'localtunnel';

async function start() {
  const subdomain = `gridxchange-${Math.random().toString(36).substring(2, 7)}`;
  console.log(`Starting localtunnel for port 3000 (subdomain: ${subdomain})...`);
  
  const tunnel = await localtunnel({
    port: 3000,
    subdomain,
  });

  console.log(`\n========================================`);
  console.log(`PUBLIC TUNNEL URL: ${tunnel.url}`);
  console.log(`========================================\n`);

  try {
    const ipRes = await fetch('https://loca.lt/mytunnelpassword');
    const ip = await ipRes.text();
    console.log(`localtunnel Password / IP if prompted: ${ip.trim()}`);
  } catch {
    // ignore
  }

  tunnel.on('close', () => {
    console.log('Tunnel closed. Restarting in 3s...');
    setTimeout(start, 3000);
  });

  tunnel.on('error', (err) => {
    console.error('Tunnel error:', err);
  });
}

start();
