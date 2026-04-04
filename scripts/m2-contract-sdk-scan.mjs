#!/usr/bin/env node
/**
 * M2 契约专项扫描：Contract 中的 *Client 接口 vs packages/sdk 中的 HttpClient。
 *
 * - 对在 SDK 中应有实现的接口：检查对应 *HttpClient 源文件存在，且声明 implements（完整实现由 TypeScript 构建保证）。
 * - 对仅由领域服务进程内实现、暂不导出 SDK 的接口：列入 allowlist，避免误报。
 *
 * 用法：node scripts/m2-contract-sdk-scan.mjs
 * CI：与 test:contract-scan 一并运行；新增 Contract Client 未更新本脚本时失败。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/** 暂不要求独立 SDK HTTP 客户端（由服务内实现或后续 wave 补齐） */
const SDK_EXEMPT_CLIENTS = new Set([
  'TaskSchedulerClient',
  'DataOrganizationClient',
  'DataGovernanceOpsClient',
  'DataIntegrationClient',
  'CostManagementClient',
  'DataGovernanceCoreClient',
]);

/** Contract 接口名 -> SDK 类文件名（不含路径） */
const CONTRACT_TO_SDK_FILE = new Map([
  ['DataOperationsClient', 'DataOperationsHttpClient.ts'],
  ['SystemAuthClient', 'SystemAuthHttpClient.ts'],
  ['SystemAdminClient', 'SystemAdminHttpClient.ts'],
  ['SystemIntegrationClient', 'SystemIntegrationHttpClient.ts'],
  ['DataSharingClient', 'DataSharingHttpClient.ts'],
  ['MetadataClient', 'MetadataHttpClient.ts'],
  ['SelfServiceAnalyticsClient', 'SelfServiceAnalyticsHttpClient.ts'],
  ['DataSecurityClient', 'DataSecurityHttpClient.ts'],
  ['DataServiceClient', 'DataServiceHttpClient.ts'],
  ['DataLifecycleClient', 'DataLifecycleHttpClient.ts'],
]);

function readInterfaceClients() {
  const modulesDir = path.join(root, 'packages/contract/src/modules');
  const names = new Set();
  for (const file of fs.readdirSync(modulesDir)) {
    if (!file.endsWith('.ts') || file.endsWith('.d.ts')) continue;
    const content = fs.readFileSync(path.join(modulesDir, file), 'utf8');
    const re = /export interface (\w+Client)\s*\{/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      names.add(m[1]);
    }
  }
  return [...names].sort();
}

function sdkFileExists(fileName) {
  const p = path.join(root, 'packages/sdk/src/clients', fileName);
  return fs.existsSync(p);
}

function sdkDeclaresImplements(clientName, fileName) {
  const content = fs.readFileSync(
    path.join(root, 'packages/sdk/src/clients', fileName),
    'utf8'
  );
  if (content.includes(`implements ${clientName}`)) {
    return true;
  }
  // 部分实现：Pick<SomeClient, 'a' | 'b'>
  if (content.includes(`implements Pick<${clientName}`)) {
    return true;
  }
  return false;
}

function main() {
  const contractClients = readInterfaceClients();
  const errors = [];
  const warnings = [];

  for (const name of contractClients) {
    if (SDK_EXEMPT_CLIENTS.has(name)) {
      continue;
    }
    const sdkFile = CONTRACT_TO_SDK_FILE.get(name);
    if (!sdkFile) {
      errors.push(
        `Contract 接口「${name}」未映射到 SDK 文件：请在 scripts/m2-contract-sdk-scan.mjs 的 CONTRACT_TO_SDK_FILE 或 SDK_EXEMPT_CLIENTS 中登记。`
      );
      continue;
    }
    if (!sdkFileExists(sdkFile)) {
      errors.push(`缺少 SDK 文件：packages/sdk/src/clients/${sdkFile}`);
      continue;
    }
    if (!sdkDeclaresImplements(name, sdkFile)) {
      warnings.push(
        `「${sdkFile}」未声明 implements ${name}（建议补全以便编译期校验契约）。`
      );
    }
  }

  console.log('[m2-contract-sdk-scan] Contract *Client 数量:', contractClients.length);
  console.log(
    '[m2-contract-sdk-scan] SDK 映射:',
    CONTRACT_TO_SDK_FILE.size,
    'SDK_EXEMPT:',
    SDK_EXEMPT_CLIENTS.size
  );

  if (warnings.length) {
    console.warn('[m2-contract-sdk-scan] 警告:\n', warnings.join('\n'));
  }

  if (errors.length) {
    console.error('[m2-contract-sdk-scan] 失败:\n', errors.join('\n'));
    process.exit(1);
  }

  console.log('[m2-contract-sdk-scan] 通过。');
}

main();
