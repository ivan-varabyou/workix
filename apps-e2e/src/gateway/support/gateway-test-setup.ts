/* eslint-disable */
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

// Настройка базового URL для Gateway
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:7101';
axios.defaults.baseURL = `${GATEWAY_URL}/api/v1`;

// Подключение к БД для проверки данных
export const getAuthPrisma = (): PrismaClient => {
  const databaseUrl = process.env.DATABASE_URL_AUTH || 'postgresql://postgres:postgres@localhost:5102/workix_auth';
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

export const getGatewayPrisma = (): PrismaClient => {
  const databaseUrl = process.env.DATABASE_URL_GATEWAY || 'postgresql://postgres:postgres@localhost:5101/workix_gateway';
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

// Тестовые данные
export const TEST_DATA = {
  user: {
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    password: 'SecurePassword123!',
  },
  weakPassword: '123',
  invalidEmail: 'not-an-email',
  sqlInjection: "'; DROP TABLE users; --",
  xssPayload: '<script>alert("xss")</script>',
  // Дополнительные payloads для тестирования безопасности
  commandInjection: '; rm -rf /; echo "',
  pathTraversal: '../../../etc/passwd',
  ldapInjection: ')(&(uid=*)(|(userPassword=*))',
  nosqlInjection: { $ne: null },
  xxePayload: '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
  ssrfUrls: [
    'http://localhost:27017',
    'http://127.0.0.1:3306',
    'http://169.254.169.254/latest/meta-data/',
    'file:///etc/passwd',
  ],
  csrfPayload: '<form action="http://evil.com" method="POST">',
  headerInjection: 'test@example.com\r\nX-Injected: malicious',
};
