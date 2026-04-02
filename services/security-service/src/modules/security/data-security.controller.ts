import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type {
  ClassificationCategoryDictItem,
  ClassificationLevelDictItem,
  EncryptionTask,
  MaskingAlgorithm,
  MaskingConfig,
  MaskingRule,
  PageResult,
  Result,
  RowLevelPolicy,
  SecurityClassification,
  WatermarkTask,
} from '@ai-datahub/contract';
import { SecurityStore } from './security.store';
import { invalidArgument, nowIso } from './security.utils';

@Controller()
export class DataSecurityController {
  constructor(@Inject(SecurityStore) private readonly store: SecurityStore) {}

  @Post('masking/algorithms')
  @HttpCode(HttpStatus.OK)
  createMaskingAlgorithm(
    @Body() body: { algorithm: Omit<MaskingAlgorithm, 'id' | 'createdAt'> }
  ): Result<{ algorithmId: string }> {
    if (!body?.algorithm?.name)
      return invalidArgument('algorithm.name is required');
    const id = this.store.nextId('alg');
    this.store.algorithms.push({ id, ...body.algorithm, createdAt: nowIso() });
    return { ok: true, data: { algorithmId: id } };
  }

  @Get('masking/algorithms')
  listMaskingAlgorithms(
    @Query() q: { keyword?: string }
  ): Result<MaskingAlgorithm[]> {
    let items = [...this.store.algorithms];
    if (q.keyword)
      items = items.filter((a) =>
        a.name.toLowerCase().includes(q.keyword.toLowerCase())
      );
    return { ok: true, data: items };
  }

  @Post('masking/rules')
  @HttpCode(HttpStatus.OK)
  createMaskingRule(
    @Body() body: { rule: Omit<MaskingRule, 'id' | 'createdAt'> }
  ): Result<{ ruleId: string }> {
    if (!body?.rule?.name) return invalidArgument('rule.name is required');
    if (!body.rule.algorithmId)
      return invalidArgument('rule.algorithmId is required');
    const id = this.store.nextId('rule');
    this.store.rules.push({ id, ...body.rule, createdAt: nowIso() });
    return { ok: true, data: { ruleId: id } };
  }

  @Get('masking/rules')
  listMaskingRules(@Query() q: { keyword?: string }): Result<MaskingRule[]> {
    let items = [...this.store.rules];
    if (q.keyword)
      items = items.filter((r) =>
        r.name.toLowerCase().includes(q.keyword.toLowerCase())
      );
    return { ok: true, data: items };
  }

  @Post('masking/configs')
  @HttpCode(HttpStatus.OK)
  upsertMaskingConfig(
    @Body()
    body: {
      config: Omit<MaskingConfig, 'createdAt' | 'updatedAt'> & { id?: string };
    }
  ): Result<{ configId: string }> {
    if (!body?.config?.dataAssetId)
      return invalidArgument('config.dataAssetId is required');
    if (!body.config.columnName)
      return invalidArgument('config.columnName is required');
    if (!body.config.ruleId)
      return invalidArgument('config.ruleId is required');
    if (!body.config.mode) return invalidArgument('config.mode is required');
    if (typeof body.config.enabled !== 'boolean')
      return invalidArgument('config.enabled is required');
    if (body.config.id) {
      const idx = this.store.configs.findIndex((x) => x.id === body.config.id);
      if (idx >= 0) {
        const existing = this.store.configs[idx];
        this.store.configs[idx] = {
          ...existing,
          ...body.config,
          updatedAt: nowIso(),
        };
        return { ok: true, data: { configId: existing.id } };
      }
    }
    const id = this.store.nextId('cfg');
    const ts = nowIso();
    this.store.configs.push({
      id,
      ...body.config,
      createdAt: ts,
      updatedAt: ts,
    });
    return { ok: true, data: { configId: id } };
  }

  @Get('masking/configs')
  listMaskingConfigs(
    @Query() q: { dataAssetId?: string }
  ): Result<MaskingConfig[]> {
    let items = [...this.store.configs];
    if (q.dataAssetId)
      items = items.filter((x) => x.dataAssetId === q.dataAssetId);
    return { ok: true, data: items };
  }

  @Post('masking/configs/:id/run')
  @HttpCode(HttpStatus.OK)
  runStaticMasking(@Param('id') id: string): Result<{ success: boolean }> {
    const c = this.store.configs.find((x) => x.id === id);
    if (!c)
      return {
        ok: false,
        error: {
          code: 'RULE_NOT_FOUND',
          message: 'Masking config not found',
          level: 'ERROR',
        },
      };
    return { ok: true, data: { success: true } };
  }

  @Post('classification')
  @HttpCode(HttpStatus.OK)
  setClassification(
    @Body()
    body: {
      dataAssetId?: string;
      classification?: SecurityClassification;
    }
  ): Result<{ success: boolean }> {
    if (!body?.dataAssetId) return invalidArgument('dataAssetId is required');
    if (!body.classification)
      return invalidArgument('classification is required');
    this.store.classifications.set(body.dataAssetId, body.classification);
    return { ok: true, data: { success: true } };
  }

  @Get('classification')
  getClassification(
    @Query() q: { dataAssetId?: string }
  ): Result<SecurityClassification> {
    if (!q.dataAssetId) return invalidArgument('dataAssetId is required');
    const c = this.store.classifications.get(q.dataAssetId);
    if (!c)
      return {
        ok: false,
        error: {
          code: 'CLASSIFICATION_NOT_FOUND',
          message: 'Classification not found',
          level: 'ERROR',
        },
      };
    return { ok: true, data: c };
  }

  @Get('classification/levels')
  listClassificationLevels(): Result<ClassificationLevelDictItem[]> {
    return {
      ok: true,
      data: [
        { level: 1, name: 'L1' },
        { level: 2, name: 'L2' },
        { level: 3, name: 'L3' },
      ],
    };
  }

  @Get('classification/categories')
  listClassificationCategories(): Result<ClassificationCategoryDictItem[]> {
    return {
      ok: true,
      data: [{ category: 'PII', name: '个人信息', level: 2 }],
    };
  }

  @Post('row-level-policies')
  @HttpCode(HttpStatus.OK)
  upsertRowLevelPolicy(
    @Body()
    body: {
      policy: Omit<RowLevelPolicy, 'id' | 'createdAt'> & { id?: string };
    }
  ): Result<{ policyId: string }> {
    if (!body?.policy?.roleId)
      return invalidArgument('policy.roleId is required');
    if (!body.policy.dataAssetId)
      return invalidArgument('policy.dataAssetId is required');
    if (!body.policy.filterExpression)
      return invalidArgument('policy.filterExpression is required');
    if (body.policy.id) {
      const idx = this.store.policies.findIndex((p) => p.id === body.policy.id);
      if (idx >= 0) {
        const existing = this.store.policies[idx];
        this.store.policies[idx] = { ...existing, ...body.policy };
        return { ok: true, data: { policyId: existing.id } };
      }
    }
    const id = this.store.nextId('rlp');
    this.store.policies.push({ id, ...body.policy, createdAt: nowIso() });
    return { ok: true, data: { policyId: id } };
  }

  @Delete('row-level-policies/:id')
  deleteRowLevelPolicy(@Param('id') id: string): Result<{ success: boolean }> {
    const before = this.store.policies.length;
    this.store.policies = this.store.policies.filter((p) => p.id !== id);
    if (this.store.policies.length === before) {
      return {
        ok: false,
        error: {
          code: 'ROW_LEVEL_POLICY_NOT_FOUND',
          message: 'Policy not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: { success: true } };
  }

  @Get('row-level-policies')
  listRowLevelPolicies(
    @Query() q: { roleId?: string; dataAssetId?: string }
  ): Result<RowLevelPolicy[]> {
    let items = [...this.store.policies];
    if (q.roleId) items = items.filter((p) => p.roleId === q.roleId);
    if (q.dataAssetId)
      items = items.filter((p) => p.dataAssetId === q.dataAssetId);
    return { ok: true, data: items };
  }

  @Post('watermark/tasks')
  @HttpCode(HttpStatus.OK)
  createWatermarkTask(
    @Body() body: { task: Omit<WatermarkTask, 'id' | 'createdAt'> }
  ): Result<{ taskId: string }> {
    if (!body?.task?.type) return invalidArgument('task.type is required');
    if (!body.task.target) return invalidArgument('task.target is required');
    const id = this.store.nextId('wm');
    this.store.watermarkTasks.push({ id, ...body.task, createdAt: nowIso() });
    return { ok: true, data: { taskId: id } };
  }

  @Get('watermark/tasks/:id')
  getWatermarkTask(@Param('id') id: string): Result<WatermarkTask> {
    const t = this.store.watermarkTasks.find((x) => x.id === id);
    if (!t)
      return {
        ok: false,
        error: {
          code: 'WATERMARK_TASK_NOT_FOUND',
          message: 'Task not found',
          level: 'ERROR',
        },
      };
    return { ok: true, data: t };
  }

  @Get('watermark/tasks')
  listWatermarkTasks(
    @Query() q: { page?: string; pageSize?: string }
  ): Result<PageResult<WatermarkTask>> {
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    const total = this.store.watermarkTasks.length;
    const start = (page - 1) * pageSize;
    const items = this.store.watermarkTasks.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items } };
  }

  @Post('watermark/parse')
  @HttpCode(HttpStatus.OK)
  parseWatermark(
    @Body() body: { inputRef?: string }
  ): Result<{ found: boolean; target?: string }> {
    if (!body?.inputRef) return invalidArgument('inputRef is required');
    return { ok: true, data: { found: true, target: 'target-1' } };
  }

  @Post('encryption/tasks')
  @HttpCode(HttpStatus.OK)
  createEncryptionTask(
    @Body() body: { task: Omit<EncryptionTask, 'id' | 'createdAt'> }
  ): Result<{ taskId: string }> {
    if (!body?.task?.type) return invalidArgument('task.type is required');
    if (!body.task.dataAssetId)
      return invalidArgument('task.dataAssetId is required');
    if (!Array.isArray(body.task.columns) || body.task.columns.length === 0)
      return invalidArgument('task.columns is required');
    if (!body.task.algorithm)
      return invalidArgument('task.algorithm is required');
    const id = this.store.nextId('enc');
    this.store.encryptionTasks.push({ id, ...body.task, createdAt: nowIso() });
    return { ok: true, data: { taskId: id } };
  }

  @Get('encryption/tasks/:id')
  getEncryptionTask(@Param('id') id: string): Result<EncryptionTask> {
    const t = this.store.encryptionTasks.find((x) => x.id === id);
    if (!t)
      return {
        ok: false,
        error: {
          code: 'ENCRYPTION_TASK_NOT_FOUND',
          message: 'Task not found',
          level: 'ERROR',
        },
      };
    return { ok: true, data: t };
  }

  @Post('encryption/tasks/:id/run')
  @HttpCode(HttpStatus.OK)
  runEncryptionTask(@Param('id') id: string): Result<{ success: boolean }> {
    const t = this.store.encryptionTasks.find((x) => x.id === id);
    if (!t)
      return {
        ok: false,
        error: {
          code: 'ENCRYPTION_TASK_NOT_FOUND',
          message: 'Task not found',
          level: 'ERROR',
        },
      };
    return { ok: true, data: { success: true } };
  }
}
