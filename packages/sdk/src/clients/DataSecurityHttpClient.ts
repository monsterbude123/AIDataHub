import type {
  ClassificationCategoryDictItem,
  ClassificationLevelDictItem,
  DataSecurityClient,
  EncryptionTask,
  MaskingAlgorithm,
  MaskingConfig,
  MaskingRule,
  PageResult,
  PageRequest,
  RequestMeta,
  Result,
  RowLevelPolicy,
  SecurityClassification,
  WatermarkTask,
} from '@ai-datahub/contract';

import type { HttpClient } from '../http/HttpClient';

export class DataSecurityHttpClient implements DataSecurityClient {
  constructor(private readonly http: HttpClient) {}

  createMaskingAlgorithm(req: {
    meta?: RequestMeta;
    algorithm: Omit<MaskingAlgorithm, 'id' | 'createdAt'>;
  }): Promise<Result<{ algorithmId: string }>> {
    return this.http.request({
      path: '/masking/algorithms',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
  listMaskingAlgorithms(req: {
    meta?: RequestMeta;
    keyword?: string;
  }): Promise<Result<MaskingAlgorithm[]>> {
    return this.http.request({
      path: '/masking/algorithms',
      method: 'GET',
      meta: req.meta,
      query: { keyword: req.keyword },
    });
  }
  createMaskingRule(req: {
    meta?: RequestMeta;
    rule: Omit<MaskingRule, 'id' | 'createdAt'>;
  }): Promise<Result<{ ruleId: string }>> {
    return this.http.request({
      path: '/masking/rules',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
  listMaskingRules(req: {
    meta?: RequestMeta;
    keyword?: string;
  }): Promise<Result<MaskingRule[]>> {
    return this.http.request({
      path: '/masking/rules',
      method: 'GET',
      meta: req.meta,
      query: { keyword: req.keyword },
    });
  }
  upsertMaskingConfig(req: {
    meta?: RequestMeta;
    config: Omit<MaskingConfig, 'createdAt' | 'updatedAt'> & { id?: string };
  }): Promise<Result<{ configId: string }>> {
    return this.http.request({
      path: '/masking/configs',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
  listMaskingConfigs(req: {
    meta?: RequestMeta;
    dataAssetId?: string;
  }): Promise<Result<MaskingConfig[]>> {
    return this.http.request({
      path: '/masking/configs',
      method: 'GET',
      meta: req.meta,
      query: { dataAssetId: req.dataAssetId },
    });
  }
  runStaticMasking(req: {
    meta?: RequestMeta;
    configId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/masking/configs/${req.configId}/run`,
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  setClassification(req: {
    meta?: RequestMeta;
    dataAssetId: string;
    classification: SecurityClassification;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/classification',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
  getClassification(req: {
    meta?: RequestMeta;
    dataAssetId: string;
  }): Promise<Result<SecurityClassification>> {
    return this.http.request({
      path: '/classification',
      method: 'GET',
      meta: req.meta,
      query: { dataAssetId: req.dataAssetId },
    });
  }
  listClassificationLevels(req: {
    meta?: RequestMeta;
  }): Promise<Result<ClassificationLevelDictItem[]>> {
    return this.http.request({
      path: '/classification/levels',
      method: 'GET',
      meta: req.meta,
    });
  }
  listClassificationCategories(req: {
    meta?: RequestMeta;
  }): Promise<Result<ClassificationCategoryDictItem[]>> {
    return this.http.request({
      path: '/classification/categories',
      method: 'GET',
      meta: req.meta,
    });
  }

  upsertRowLevelPolicy(req: {
    meta?: RequestMeta;
    policy: Omit<RowLevelPolicy, 'id' | 'createdAt'> & { id?: string };
  }): Promise<Result<{ policyId: string }>> {
    return this.http.request({
      path: '/row-level-policies',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
  deleteRowLevelPolicy(req: {
    meta?: RequestMeta;
    policyId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/row-level-policies/${req.policyId}`,
      method: 'DELETE',
      meta: req.meta,
    });
  }
  listRowLevelPolicies(req: {
    meta?: RequestMeta;
    roleId?: string;
    dataAssetId?: string;
  }): Promise<Result<RowLevelPolicy[]>> {
    return this.http.request({
      path: '/row-level-policies',
      method: 'GET',
      meta: req.meta,
      query: { roleId: req.roleId, dataAssetId: req.dataAssetId },
    });
  }

  createWatermarkTask(req: {
    meta?: RequestMeta;
    task: Omit<WatermarkTask, 'id' | 'createdAt'>;
  }): Promise<Result<{ taskId: string }>> {
    return this.http.request({
      path: '/watermark/tasks',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
  getWatermarkTask(req: {
    meta?: RequestMeta;
    taskId: string;
  }): Promise<Result<WatermarkTask>> {
    return this.http.request({
      path: `/watermark/tasks/${req.taskId}`,
      method: 'GET',
      meta: req.meta,
    });
  }
  listWatermarkTasks(req: {
    meta?: RequestMeta;
    page: PageRequest;
  }): Promise<Result<PageResult<WatermarkTask>>> {
    return this.http.request({
      path: '/watermark/tasks',
      method: 'GET',
      meta: req.meta,
      query: { page: req.page.page, pageSize: req.page.pageSize },
    });
  }
  parseWatermark(req: {
    meta?: RequestMeta;
    inputRef: string;
  }): Promise<Result<{ found: boolean; target?: string }>> {
    return this.http.request({
      path: '/watermark/parse',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  createEncryptionTask(req: {
    meta?: RequestMeta;
    task: Omit<EncryptionTask, 'id' | 'createdAt'>;
  }): Promise<Result<{ taskId: string }>> {
    return this.http.request({
      path: '/encryption/tasks',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
  getEncryptionTask(req: {
    meta?: RequestMeta;
    taskId: string;
  }): Promise<Result<EncryptionTask>> {
    return this.http.request({
      path: `/encryption/tasks/${req.taskId}`,
      method: 'GET',
      meta: req.meta,
    });
  }
  runEncryptionTask(req: {
    meta?: RequestMeta;
    taskId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/encryption/tasks/${req.taskId}/run`,
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
}
