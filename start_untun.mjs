import { startTunnel } from 'untun';

async function main() {
  console.log('Starting Cloudflare tunnel via untun for port 3000...');
  try {
    const tunnel = await startTunnel({
      port: 3000,
    });
    
    if (tunnel) {
      const url = await tunnel.getURL();
      console.log('\n======================================================');
      console.log(`PUBLIC URL: ${url}`);
      console.log('======================================================\n');
    }
  } catch (err) {
    console.error('untun error:', err);
  }
}

main();
