#!/usr/bin/env node
/**
 * 开发环境服务状态检查脚本
 * 用途：检查所有 AI DataHub 服务的运行状态和健康状况
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import http from 'node:http';
import { setTimeout as sleep } from 'node:timers/promises';

const SERVICES_CONFIG = JSON.parse(
  readFileSync('scripts/services.json', 'utf-8')
);
const HEALTH_CHECK_RETRIES = 3;
const HEALTH_CHECK_RETRY_DELAY_MS = 1000;

console.log('📊 AI DataHub 服务状态检查');
console.log('==========================');

// 检查端口是否正在监听
function isPortListening(port) {
  return new Promise((resolve) => {
    const socket = new http.Agent().createConnection({
      port,
      host: 'localhost',
      timeout: 2000,
    });

    socket.on('connect', () => {
      socket.end();
      resolve(true);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.setTimeout(2000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

// 检查健康接口，带重试
async function checkHealthEndpoint(url) {
  for (let i = 0; i < HEALTH_CHECK_RETRIES; i++) {
    const result = await doCheckHealth(url);
    if (result) return true;
    if (i < HEALTH_CHECK_RETRIES - 1) {
      await sleep(HEALTH_CHECK_RETRY_DELAY_MS);
    }
  }
  return false;
}

// 实际检查健康接口
function doCheckHealth(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const req = http.get(
      {
        hostname: urlObj.hostname,
        port: parseInt(urlObj.port, 10),
        path: urlObj.pathname,
        timeout: 3000,
      },
      (res) => {
        resolve(res.statusCode === 200);
      }
    );

    req.on('error', () => {
      resolve(false);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// 主流程
async function checkAllServices() {
  console.log('🔍 正在检查应用服务状态...');
  console.log('-------------------------');

  let runningCount = 0;
  let healthyCount = 0;

  for (const service of SERVICES_CONFIG.services) {
    const portListening = await isPortListening(service.port);

    if (portListening) {
      runningCount++;

      // 检查健康接口（带重试）
      const healthOk = await checkHealthEndpoint(service.healthCheck);
      if (healthOk) {
        healthyCount++;
        console.log(`✅ ${service.name} (${service.port}) - 运行正常`);
      } else {
        console.log(
          `⚠️ ${service.name} (${service.port}) - 端口监听中，但健康检查失败`
        );
      }
    } else {
      console.log(`🔴 ${service.name} (${service.port}) - 未运行`);
    }
  }

  console.log('-------------------------');
  console.log(
    `统计: ${runningCount}/${SERVICES_CONFIG.services.length} 个服务正在运行`
  );
  if (runningCount > 0) {
    console.log(`健康: ${healthyCount}/${runningCount} 个服务健康检查通过`);
  }

  // 检查 Docker 基础设施状态
  try {
    console.log();
    console.log('🐳 Docker 基础设施状态:');
    console.log('------------------------');

    const dockerPs = execSync('docker ps --format "{{.Names}}: {{.Status}}"', {
      encoding: 'utf-8',
    });
    const containers = dockerPs.split('\n').filter(Boolean);

    let infraRunning = 0;
    containers.forEach((container) => {
      const [name, status] = container.split(': ');
      if (name.startsWith('aidatahub-')) {
        const isHealthy = status.includes('Up');
        if (isHealthy) infraRunning++;
        console.log(`${isHealthy ? '✅' : '🔴'} ${name}: ${status}`);
      }
    });

    const requiredInfra = 3; // postgres, redis, rabbitmq
    if (infraRunning < requiredInfra) {
      console.log();
      console.log('⚠️  部分基础设施服务未运行，运行 `npm run infra:up` 启动');
    }
  } catch (error) {
    console.log('⚠️  无法检查 Docker 状态 (Docker 可能未启动)');
  }

  // 输出网关访问地址
  const gateway = SERVICES_CONFIG.services.find(
    (s) => s.name === 'api-gateway'
  );
  if (gateway && (await isPortListening(gateway.port))) {
    console.log();
    console.log('🌐 API 网关访问地址:');
    console.log('   http://localhost:3000');
    console.log('   http://localhost:3000/health - 健康检查');
  }
}

checkAllServices().catch((error) => {
  console.error('❌ 检查服务状态时出错:', error);
  process.exit(1);
});
