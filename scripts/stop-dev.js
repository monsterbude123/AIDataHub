#!/usr/bin/env node
/**
 * 开发环境服务停止脚本
 * 用途：停止所有正在运行的 AI DataHub 应用服务
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SERVICES_CONFIG = JSON.parse(
  readFileSync('scripts/services.json', 'utf-8')
);
const IS_WINDOWS = process.platform === 'win32';

console.log('🔴 AI DataHub 服务停止器');
console.log('========================');

function getProcessIdsByPort(port) {
  try {
    let output;

    if (IS_WINDOWS) {
      output = execSync(`netstat -ano | findstr :${port}`, {
        encoding: 'utf-8',
      });
      const lines = output
        .split('\n')
        .filter((line) => line.includes('LISTENING'));
      return lines
        .map((line) => line.trim().split(/\s+/).pop())
        .filter(Boolean);
    } else {
      output = execSync(`lsof -ti :${port}`, { encoding: 'utf-8' });
      return output.split('\n').filter(Boolean);
    }
  } catch {
    return [];
  }
}

function killProcesses(pids, serviceName) {
  if (pids.length === 0) return;

  console.log(`   终止 ${serviceName} (PID: ${pids.join(', ')})`);
  try {
    if (IS_WINDOWS) {
      pids.forEach((pid) => {
        try {
          execSync(`taskkill /F /PID ${pid}`, { encoding: 'utf-8' });
        } catch (err) {
          console.log(`   ℹ️  进程 ${pid} 可能已经终止`);
        }
      });
    } else {
      execSync(`kill ${pids.join(' ')}`, { encoding: 'utf-8' });
    }
  } catch (error) {
    console.error(`   ⚠️  无法正常终止进程，尝试强制终止...`);
    try {
      if (IS_WINDOWS) {
        pids.forEach((pid) => {
          try {
            execSync(`taskkill /F /PID ${pid}`, { encoding: 'utf-8' });
          } catch (err) {
            console.log(`   ℹ️  进程 ${pid} 可能已经终止`);
          }
        });
      } else {
        execSync(`kill -9 ${pids.join(' ')}`, { encoding: 'utf-8' });
      }
    } catch (forceKillError) {
      console.error(`   ❌ 无法强制终止进程 ${pids.join(', ')}`);
    }
  }
}

// 主流程
console.log('📊 正在检查服务状态...');

let allProcesses = [];

// 检查每个服务的端口
SERVICES_CONFIG.services.forEach((service) => {
  const pids = getProcessIdsByPort(service.port);
  if (pids.length > 0) {
    console.log(
      `🔍 发现 ${service.name} 在端口 ${service.port} 运行 (PID: ${pids.join(', ')})`
    );
    allProcesses.push({ service, pids });
  }
});

// 停止服务
if (allProcesses.length > 0) {
  console.log();
  console.log('⏹️  正在停止服务...');

  allProcesses.forEach(({ service, pids }) => {
    killProcesses(pids, service.name);
  });

  console.log();
  console.log('✅ 所有服务已停止！');
} else {
  console.log('ℹ️  没有正在运行的 AI DataHub 服务');
}
