#!/usr/bin/env node
/**
 * 开发环境服务启动脚本
 * 用途：并行启动所有 AI DataHub 应用服务
 * 使用说明：
 *   node scripts/start-dev.js [options]
 *   node scripts/start-dev.js [--services auth,metadata,gateway] [--no-build]
 *
 * 全自动：自动构建基础包、自动复制.env、自动启动Docker基础设施
 * 选项：
 *   --services=list   只启动指定服务（逗号分隔）
 *   --no-build        跳过构建检查（开发调试时加速）
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync, copyFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import concurrently from 'concurrently';
import dotenv from 'dotenv';

// 加载根目录 .env 配置
if (existsSync('.env')) {
  dotenv.config();
}

// 根据 APP_ENV 自动设置 DATABASE_URL
const appEnv = process.env.APP_ENV || 'dev';
const dbUrlEnv = `DATABASE_URL_${appEnv.toUpperCase()}`;
if (process.env[dbUrlEnv]) {
  process.env.DATABASE_URL = process.env[dbUrlEnv];
  console.log(`🔧 自动设置 DATABASE_URL from ${dbUrlEnv}`);
}

// 配置常量
const INFRASTRUCTURE_WAIT_MS = 30000; // Windows Docker PostgreSQL 初始化需要更长时间
const STARTUP_INFO_DELAY_MS = 2000;
const REQUIRED_INFRA_SERVICES = ['postgres', 'redis', 'rabbitmq'];

const SERVICES_CONFIG = JSON.parse(
  readFileSync('scripts/services.json', 'utf-8')
);

// 验证配置
function validateServiceConfig(config) {
  if (!Array.isArray(config.services)) {
    console.error('❌ 无效的服务配置：services 必须是数组');
    process.exit(1);
  }

  const invalid = config.services.find(
    (s) => !s.name || !s.script || !s.port || !s.healthCheck
  );
  if (invalid) {
    console.error(
      `❌ 无效的服务配置：服务 ${invalid?.name || 'unknown'} 缺少必填字段`
    );
    process.exit(1);
  }
}

// 解析命令行参数
function parseCommandLineArgs() {
  const args = process.argv.slice(2);
  let serviceFilters = null;
  let skipBuild = false;

  for (const arg of args) {
    if (arg === '--no-build' || arg === '--skip-build') {
      skipBuild = true;
      continue;
    }
    if (arg.startsWith('--services=')) {
      serviceFilters = arg
        .split('=')[1]
        .split(',')
        .map((s) => s.trim());
      continue;
    } else if (arg === '--services' && args.length > args.indexOf(arg) + 1) {
      serviceFilters = args[args.indexOf(arg) + 1]
        .split(',')
        .map((s) => s.trim());
      continue;
    }
  }

  return { serviceFilters, skipBuild };
}

// 筛选要启动的服务 - 通过服务名前缀匹配
function filterServices(serviceFilters) {
  if (!serviceFilters) {
    return SERVICES_CONFIG.services;
  }

  return SERVICES_CONFIG.services.filter((s) => {
    const shortName = s.name.split('-')[0];
    return serviceFilters.some(
      (filter) => shortName.includes(filter) || s.name.includes(filter)
    );
  });
}

// 打印启动信息
function printStartupInfo(servicesToStart) {
  console.log('🚀 AI DataHub 全自动启动器');
  console.log('=========================');
  console.log(`即将启动 ${servicesToStart.length} 个应用服务:`);
  servicesToStart.forEach((s) =>
    console.log(`  - ${s.name} (${s.description})`)
  );
  console.log();
}

// 自动准备 .env 文件 - 如果不存在则从 .env.example 复制（使用 Node API 跨平台兼容）
function prepareEnvFiles(servicesToStart) {
  console.log('📝 检查并准备 .env 配置文件...');
  let copied = 0;
  servicesToStart.forEach((s) => {
    const serviceDir = `services/${s.workspace.split('/')[1]}`;
    const envFile = `${serviceDir}/.env`;
    const envExample = `${serviceDir}/.env.example`;
    if (!existsSync(envFile) && existsSync(envExample)) {
      console.log(`  复制 ${envExample} -> ${envFile}`);
      copyFileSync(envExample, envFile);
      copied++;
    }
  });
  if (copied > 0) {
    console.log(`✅ 已自动复制 ${copied} 个 .env 文件`);
  } else {
    console.log('✅ 所有 .env 文件已就绪');
  }
  console.log();
}

// 确保 Prisma Client 已生成 - 总是运行，确保生成完成
function checkPrismaGenerated() {
  console.log('⚙️  生成 Prisma Client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit', cwd: 'packages/database' });
    console.log('✅ Prisma Client 生成完成');
  } catch (error) {
    // On Windows, we sometimes get EPERM when overwriting, but it's usually already generated
    console.log('⚠️  Prisma generate 警告：' + error.message);
    console.log('继续启动...');
  }
  console.log();
}

// 检查是否已构建，如果 dist 不存在则自动构建
function checkAndBuild(skipBuild) {
  if (!skipBuild) {
    console.log('🔨 全量构建所有代码...');
    // 完整构建一次，确保所有 packages 和 services 都编译好了
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ 全量构建完成');
    console.log();
  } else {
    console.log('🔨 skip-build 标志设置，跳过构建');
    console.log();
  }

  // 总是检查 Prisma Client - 需要即使 skip-build 也要确保生成
  checkPrismaGenerated();
}

// 检查 Docker 基础设施是否运行
// 返回 true 如果刚刚启动了新容器（需要等待初始化），false 如果已经全部运行
function checkInfrastructure() {
  try {
    console.log('🔍 检查 Docker 基础设施...');

    // 通过 docker-compose 检查运行状态
    const output = execSync(
      'docker-compose ps --services --filter "status=running"',
      { encoding: 'utf-8' }
    );
    const runningServices = output.split('\n').filter(Boolean);

    const missingServices = REQUIRED_INFRA_SERVICES.filter(
      (s) => !runningServices.includes(s)
    );

    if (missingServices.length > 0) {
      console.log('⚠️  缺少以下 Docker 服务，正在启动...');
      console.log(`   ${missingServices.join(', ')}`);
      execSync('docker-compose up -d', { stdio: 'inherit' });
      console.log('✅ Docker 基础设施启动成功');
      return true; // 需要等待初始化
    } else {
      console.log('✅ Docker 基础设施已在运行');
      return false; // 不需要等待
    }
  } catch (error) {
    console.error('❌ 检查 Docker 基础设施失败:', error.message);
    console.log('💡 提示：请确保 Docker 已安装并正在运行');
    process.exit(1);
  }
}

// 显示访问信息
function displayAccessInfo(servicesToStart) {
  console.log();
  console.log('✨ 所有服务启动中...');
  console.log('============================');
  servicesToStart.forEach((s) => {
    console.log(`   ${s.name}: http://localhost:${s.port}`);
  });
  console.log();
  console.log('📊 运行 `npm run dev:status` 检查服务健康状态');
  console.log('🛑 按 Ctrl+C 停止所有服务');
  console.log();
}

// 使用 concurrently 编程式 API 启动所有服务
function startAllServicesWithConcurrently(services) {
  // 转换为 concurrently 任务格式
  const tasks = services.map(s => {
    const serviceDir = `services/${s.workspace.split('/')[1]}`;
    const envFile = `${serviceDir}/.env`;

    // Start with process env
    const env = { ...process.env };

    // Read and parse .env file first
    // Because we want config PORT to override any PORT from .env
    if (existsSync(envFile)) {
      const content = readFileSync(envFile, 'utf-8');
      const lines = content.split('\n');
      let appEnv = env.APP_ENV || 'dev';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        // Remove quotes
        const cleanValue = value.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
        env[key.trim()] = cleanValue;
        if (key.trim() === 'APP_ENV') {
          appEnv = cleanValue;
        }
      }

      // Auto-set DATABASE_URL based on APP_ENV from root or service env
      const finalDbUrlKey = `DATABASE_URL_${appEnv.toUpperCase()}`;
      const finalDbUrl = env[finalDbUrlKey];
      if (finalDbUrl && !env.DATABASE_URL) {
        env.DATABASE_URL = finalDbUrl;
      }
    }

    // Set PORT from configuration LAST - it overrides any PORT from .env
    env.PORT = String(s.port);

    // In root package.json the script is like 'dev:auth', but in service directory it's just 'dev'
    const actualScript = s.script.split(':')[0];
    return {
      name: s.name,
      command: `npm run ${actualScript}`,
      cwd: serviceDir,
      env: env
    };
  });

  console.log();
  console.log('🎯 启动所有服务...');
  console.log();

  // 使用 concurrently 启动
  const { result } = concurrently(tasks, {
    prefix: 'name',
    outputAlwaysOn: true,
    killOthersOnError: false,
  });

  // 处理结果
  result.then(results => {
    const anyFailed = results.some(r => r.exitCode !== 0 && r.exitCode !== null);
    if (!anyFailed) {
      console.log('\n✅ 所有服务已停止');
      process.exit(0);
    }
    // concurrently already prints errors
    process.exit(1);
  }).catch(error => {
    console.error('\n❌ 启动服务时出错:', error);
    process.exit(1);
  });

  // 监听用户中断信号
  process.on('SIGINT', () => {
    console.log('\n🔴 接收到中断信号，正在停止所有服务...');
  });
}

// 主函数
async function startAllServicesConcurrently() {
  try {
    // 验证配置
    validateServiceConfig(SERVICES_CONFIG);

    // 解析参数
    const { serviceFilters, skipBuild } = parseCommandLineArgs();

    // 筛选服务
    const servicesToStart = filterServices(serviceFilters);

    // 打印启动信息
    printStartupInfo(servicesToStart);

    // 自动准备 .env 文件
    prepareEnvFiles(servicesToStart);

    // 检查并自动构建
    checkAndBuild(skipBuild);

    // 检查并启动 Docker 基础设施
    const needWait = checkInfrastructure();

    // 只有在刚刚启动新容器时才等待初始化
    if (needWait) {
      console.log('⏳ 等待 PostgreSQL/Redis/RabbitMQ 初始化...');
      await sleep(INFRASTRUCTURE_WAIT_MS);
    } else {
      console.log('⏭️  基础设施已就绪，跳过等待');
    }

    // 自动运行 Prisma 数据库迁移创建数据库
    console.log('🗄️  运行数据库迁移...');
    try {
      execSync('npx prisma migrate dev', { stdio: 'inherit', cwd: 'packages/database' });
      console.log('✅ 数据库迁移完成');
    } catch (error) {
      console.log('⚠️  数据库迁移警告:', error.message);
      console.log('继续启动...');
    }
    console.log();

    // 显示访问信息（延迟显示等待服务开始监听）
    setTimeout(() => {
      displayAccessInfo(servicesToStart);
    }, STARTUP_INFO_DELAY_MS);

    // 使用编程式 API 启动 - 避免 shell  quoting 问题
    startAllServicesWithConcurrently(servicesToStart);
  } catch (error) {
    console.error('❌ 启动服务时出错:', error);
    process.exit(1);
  }
}

// 执行
startAllServicesConcurrently();
