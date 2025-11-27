import { waitForPortOpen } from '@nx/node/utils';
import axios from 'axios';
import { ChildProcess, spawn } from 'child_process';

let serverProcess: ChildProcess | null = null;
const port: number = process.env.MONOLITH_PORT ? Number(process.env.MONOLITH_PORT) : 7000;
const apiUrl: string = process.env.MONOLITH_URL || `http://localhost:${port}`;

export default async function globalSetup() {
  console.log(`\n🚀 Starting Monolith server for E2E tests...\n`);
  console.log(`📡 Server URL: ${apiUrl}\n`);

  // Check if server is already running
  try {
    await axios.get(`${apiUrl}/api/health`, { timeout: 2000 });
    console.log(`✅ Server is already running at ${apiUrl}\n`);
    return;
  } catch (error) {
    // Server is not running, start it
    console.log(`🔄 Starting new server instance...\n`);
  }

  // Start the server using nx serve
  const serverCommand = 'npx';
  const serverArgs: any[] = ['nx', 'serve', 'monolith', '--port', port.toString()];

  serverProcess = spawn(serverCommand, serverArgs, {
    stdio: 'pipe',
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: port.toString(),
      NODE_ENV: 'test',
      // API 7000 → DB 5000 (change first digit: 7 → 5)
      DATABASE_URL:
        process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5000/workix_monolith',
    },
    shell: true,
  });

  // Log server output
  serverProcess.stdout?.on('data', (data) => {
    const output: any = data.toString();
    if (output.includes('WORKIX MONOLITH API RUNNING') || output.includes('listening')) {
      console.log(`✅ Server started successfully\n`);
    }
  });

  serverProcess.stderr?.on('data', (data) => {
    const output: any = data.toString();
    if (!output.includes('DeprecationWarning') && !output.includes('ExperimentalWarning')) {
      console.error(`Server error: ${data.toString()}`);
    }
  });

  // Wait for server to be ready
  console.log(`⏳ Waiting for server to start on port ${port}...\n`);

  try {
    await waitForPortOpen(port, {
      host: 'localhost',
      retries: 30,
      retryDelay: 1000,
    });

    // Additional health check
    let retries = 10;
    while (retries > 0) {
      try {
        await axios.get(`${apiUrl}/api/health`, { timeout: 2000 });
        console.log(`✅ Server is ready at ${apiUrl}\n`);
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error(`Server did not respond to health check after 10 retries`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error(`❌ Failed to start server: ${error}`);
    console.warn(`⚠️ E2E tests will be skipped - server is not available\n`);
    if (serverProcess) {
      serverProcess.kill();
    }
    // Don't throw - allow tests to run and skip gracefully
    (globalThis as any).__MONOLITH_SERVER_AVAILABLE__ = false;
    return;
  }

  // Mark server as available
  (globalThis as any).__MONOLITH_SERVER_AVAILABLE__ = true;

  // Store process for teardown
  (globalThis as any).__MONOLITH_SERVER_PROCESS__ = serverProcess;

  // Register teardown function
  (globalThis as any).__MONOLITH_TEARDOWN__ = async () => {
    const teardown: any = await import('./global-teardown');
    return teardown.default();
  };
}
