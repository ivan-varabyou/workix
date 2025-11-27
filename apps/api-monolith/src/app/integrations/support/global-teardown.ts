import { killPort } from '@nx/node/utils';

const port: number = process.env.MONOLITH_PORT ? Number(process.env.MONOLITH_PORT) : 7000;

export default async function globalTeardown() {
  console.log(`\n🛑 Stopping Monolith server...\n`);

  // Kill the server process if it exists
  const serverProcess: any = (globalThis as any).__MONOLITH_SERVER_PROCESS__;
  if (serverProcess) {
    try {
      serverProcess.kill('SIGTERM');
      console.log(`✅ Server process terminated\n`);
    } catch (error) {
      console.error(`⚠️ Error killing server process: ${error}\n`);
    }
  }

  // Kill any process on the port
  try {
    await killPort(port);
    console.log(`✅ Port ${port} is now free\n`);
  } catch (error) {
    console.error(`⚠️ Error killing port ${port}: ${error}\n`);
  }

  console.log(`✅ Teardown complete\n`);
}
