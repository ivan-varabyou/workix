/* eslint-disable */
import axios from 'axios';

/**
 * Setup for Auth Service E2E tests
 * Configures axios base URL for auth service
 */
module.exports = async function () {
  const host = process.env.AUTH_SERVICE_HOST ?? 'localhost';
  const port = process.env.AUTH_SERVICE_PORT ?? '7200';
  const baseURL = process.env.AUTH_SERVICE_URL ?? `http://${host}:${port}`;

  axios.defaults.baseURL = baseURL;
  axios.defaults.timeout = 10000; // 10 seconds timeout

  console.log(`🔧 Auth E2E tests configured for: ${baseURL}`);
};
