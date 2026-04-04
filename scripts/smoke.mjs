#!/usr/bin/env node
/**
 * Smoke 测试：
 * 1) 等待 Postgres 就绪
 * 2) 等待 Redis / RabbitMQ 就绪
 * 3) 执行 Prisma migrate deploy
 * 4) 依次调用各核心服务 /health
 * 5) 校验关键业务流（metadata source create/list）
 *
 * 用法（已在 docker-compose/full 中提供 postgres 服务）：
 *   node scripts/smoke.mjs
 */
import { execSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import net from 'node:net';

const POSTGRES_URL =
  process.env.DATABASE_URL_DEV ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/aidatahub?schema=public';
const REDIS_HOST = process.env.REDIS_HOST ?? '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT ?? '6379');
const RABBITMQ_HOST = process.env.RABBITMQ_HOST ?? '127.0.0.1';
const RABBITMQ_PORT = Number(process.env.RABBITMQ_PORT ?? '5672');

const SERVICES = [
  { name: 'auth-service', url: 'http://localhost:4001/health' },
  { name: 'metadata-service', url: 'http://localhost:4002/health' },
  { name: 'data-service', url: 'http://localhost:4003/health' },
  { name: 'task-scheduler', url: 'http://localhost:5001/health' },
  { name: 'ops-service', url: 'http://localhost:3001/health' },
  { name: 'integration-service', url: 'http://localhost:3002/health' },
  { name: 'admin-service', url: 'http://localhost:3003/health' },
  { name: 'sharing-service', url: 'http://localhost:3004/health' },
  { name: 'analytics-service', url: 'http://localhost:3005/health' },
  { name: 'security-service', url: 'http://localhost:3006/health' },
];

function log(msg) {
  // eslint-disable-next-line no-console
  console.log(`[smoke] ${msg}`);
}

async function waitForPostgres(timeoutMs = 60_000) {
  await waitForTcp('Postgres', process.env.POSTGRES_HOST ?? '127.0.0.1', Number(process.env.POSTGRES_PORT ?? '5432'), timeoutMs);
}

async function runMigrations() {
  log('Running Prisma migrate deploy...');
  execSync(
    `npm -w @ai-datahub/database run db:migrate:deploy`,
    {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: POSTGRES_URL },
    }
  );
}

async function waitForTcp(name, host, port, timeoutMs = 60_000) {
  const start = Date.now();
  while (true) {
    const connected = await new Promise((resolve) => {
      const socket = net.createConnection({ host, port }, () => {
        socket.end();
        resolve(true);
      });
      socket.on('error', () => resolve(false));
    });
    if (connected) {
      log(`${name} is ready`);
      return;
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out waiting for ${name}`);
    }
    log(`Waiting for ${name}...`);
    // eslint-disable-next-line no-await-in-loop
    await sleep(2_000);
  }
}

async function checkHealth() {
  for (const svc of SERVICES) {
    try {
      log(`Checking ${svc.name} at ${svc.url}`);
      execSync(`curl -sf ${svc.url}`, { stdio: 'ignore' });
      log(`${svc.name} OK`);
    } catch {
      throw new Error(`Health check failed for ${svc.name}`);
    }
  }
}

async function checkCriticalFlow() {
  const createBody = JSON.stringify({
    name: 'smoke-source',
    type: 'MYSQL',
    host: 'localhost',
    port: 3306,
    username: 'smoke',
    password: 'smoke',
    database: 'smoke',
  });
  execSync(
    `curl -sf -X POST http://localhost:4002/api/metadata/sources -H "Content-Type: application/json" -d "${createBody.replace(/"/g, '\\"')}"`,
    { stdio: 'ignore' }
  );
  execSync(`curl -sf http://localhost:4002/api/metadata/sources`, { stdio: 'ignore' });
  log('Critical metadata flow OK');
}

async function main() {
  try {
    await waitForPostgres();
    await waitForTcp('Redis', REDIS_HOST, REDIS_PORT);
    await waitForTcp('RabbitMQ', RABBITMQ_HOST, RABBITMQ_PORT);
    await runMigrations();
    await checkHealth();
    await checkCriticalFlow();
    log('Smoke tests passed.');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[smoke] FAILED', err);
    process.exit(1);
  }
}

main();

