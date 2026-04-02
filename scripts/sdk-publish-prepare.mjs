#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

const args = process.argv.slice(2);
const versionArg = args.find((a) => a.startsWith('--version=')) ?? '';
const tagArg = args.find((a) => a.startsWith('--tag=')) ?? '';
const version = versionArg.split('=')[1] ?? '1.0.0-alpha.3';
const distTag = tagArg.split('=')[1] ?? 'alpha';

console.log(`[sdk-publish] target version: ${version}`);
console.log(`[sdk-publish] dist-tag: ${distTag}`);

run('npm', ['run', 'build', '-w', 'packages/contract']);
run('npm', ['run', 'build', '-w', 'packages/shared']);
run('npm', ['test', '-w', 'packages/sdk']);
run('npm', ['run', 'build', '-w', 'packages/sdk']);
run('npm', ['pack', '--dry-run', '-w', 'packages/sdk']);

const outDir = resolve(process.cwd(), 'doc', 'releases');
mkdirSync(outDir, { recursive: true });
const outFile = resolve(outDir, `sdk-${version}.md`);
const template = `# @ai-datahub/sdk ${version} 发布说明

## 发布标签

- dist-tag: \`${distTag}\`

## 变更摘要

- feat: 
- fix: 
- docs: 

## 兼容性

- 与 \`@ai-datahub/contract\` 对齐版本：\`0.1.0\`
- 与 \`@ai-datahub/shared\` 对齐版本：\`0.1.0\`

## 验证记录

- [x] npm run build -w packages/contract
- [x] npm run build -w packages/shared
- [x] npm test -w packages/sdk
- [x] npm run build -w packages/sdk
- [x] npm pack --dry-run -w packages/sdk

## 发布命令

\`\`\`bash
# 1) 生成 changeset（交互）
npm run change

# 2) 落版本号
npm run version

# 3) 发布
npm run release

# 或仅发布 sdk（如需精确控制）
npm publish --tag ${distTag} --access public -w packages/sdk
\`\`\`
`;
writeFileSync(outFile, template, 'utf-8');
console.log(`[sdk-publish] release note template generated: ${outFile}`);

