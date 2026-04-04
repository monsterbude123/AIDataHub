import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Delete,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type {
  AlertChannel,
  AlertChannelConfig,
  ISODateTime,
  PageResult,
  Result,
} from '@ai-datahub/contract';
import type { AlertRule } from '@ai-datahub/contract';
import type { FastifyReply } from 'fastify';

type CreateAlertRuleBody = {
  rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>;
};
type UpdateAlertRuleBody = {
  rule: Omit<AlertRule, 'createdAt' | 'updatedAt'>;
};
type ListAlertRulesQuery = {
  page?: string;
  pageSize?: string;
  keyword?: string;
  enabled?: string;
  type?: AlertRule['type'];
};

type UpsertAlertChannelConfigBody = {
  config: Omit<AlertChannelConfig, 'updatedAt'>;
};

function nowIso(): string {
  return new Date().toISOString();
}

const allowedChannels = new Set<AlertChannel>([
  'EMAIL',
  'SMS',
  'DINGTALK',
  'WECHAT_WORK',
]);

function invalidArgument(message: string): Result<never> {
  return {
    ok: false,
    error: { code: 'INVALID_ARGUMENT', message, level: 'ERROR' },
  };
}

@Controller('alerts')
export class DataOperationsController {
  private rules: AlertRule[] = [];
  private channelConfigs = new Map<AlertChannel, AlertChannelConfig>();

  @Post('rules')
  createAlertRule(
    @Body() body: CreateAlertRuleBody,
    @Res({ passthrough: true }) reply: FastifyReply
  ): Result<{ ruleId: string }> {
    if (!body || typeof body !== 'object' || !('rule' in body)) {
      reply.code(HttpStatus.OK);
      return invalidArgument('Missing rule');
    }
    const r = body.rule as CreateAlertRuleBody['rule'];
    if (!r.name || typeof r.name !== 'string') {
      reply.code(HttpStatus.OK);
      return invalidArgument('rule.name is required');
    }
    if (!Array.isArray(r.channels) || r.channels.length === 0) {
      reply.code(HttpStatus.OK);
      return invalidArgument('rule.channels is required');
    }
    for (const ch of r.channels) {
      if (typeof ch !== 'string' || !allowedChannels.has(ch)) {
        reply.code(HttpStatus.OK);
        return invalidArgument('rule.channels contains invalid channel');
      }
    }
    if (!r.type) {
      reply.code(HttpStatus.OK);
      return invalidArgument('rule.type is required');
    }
    if (typeof r.enabled !== 'boolean') {
      reply.code(HttpStatus.OK);
      return invalidArgument('rule.enabled is required');
    }
    if (!r.config || typeof r.config !== 'object') {
      reply.code(HttpStatus.OK);
      return invalidArgument('rule.config is required');
    }

    const id = `ar_${this.rules.length + 1}`;
    const ts = nowIso();
    const rule: AlertRule = {
      id,
      ...r,
      createdAt: ts,
      updatedAt: ts,
    };
    this.rules.push(rule);
    reply.code(HttpStatus.CREATED);
    return { ok: true, data: { ruleId: id } };
  }

  @Put('rules')
  updateAlertRule(
    @Body() body: UpdateAlertRuleBody
  ): Result<{ success: boolean }> {
    if (!body || typeof body !== 'object' || !('rule' in body)) {
      return invalidArgument('Missing rule');
    }
    const r = body.rule as UpdateAlertRuleBody['rule'];
    if (!r.id || typeof r.id !== 'string') {
      return invalidArgument('rule.id is required');
    }
    if (!r.name || typeof r.name !== 'string') {
      return invalidArgument('rule.name is required');
    }
    if (!Array.isArray(r.channels) || r.channels.length === 0) {
      return invalidArgument('rule.channels is required');
    }
    for (const ch of r.channels) {
      if (typeof ch !== 'string' || !allowedChannels.has(ch)) {
        return invalidArgument('rule.channels contains invalid channel');
      }
    }
    if (!r.type) {
      return invalidArgument('rule.type is required');
    }
    if (typeof r.enabled !== 'boolean') {
      return invalidArgument('rule.enabled is required');
    }
    if (!r.config || typeof r.config !== 'object') {
      return invalidArgument('rule.config is required');
    }

    const idx = this.rules.findIndex((r) => r.id === body.rule.id);
    if (idx < 0) {
      return {
        ok: false,
        error: {
          code: 'ALERT_RULE_NOT_FOUND',
          message: 'Alert rule not found',
          level: 'ERROR',
        },
      };
    }
    const existing = this.rules[idx];
    this.rules[idx] = {
      ...existing,
      ...r,
      updatedAt: nowIso(),
    };
    return { ok: true, data: { success: true } };
  }

  @Delete('rules/:id')
  deleteAlertRule(@Param('id') id: string): Result<{ success: boolean }> {
    const before = this.rules.length;
    this.rules = this.rules.filter((r) => r.id !== id);
    if (this.rules.length === before) {
      return {
        ok: false,
        error: {
          code: 'ALERT_RULE_NOT_FOUND',
          message: 'Alert rule not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: { success: true } };
  }

  @Get('rules')
  listAlertRules(): Result<AlertRule[]> {
    return { ok: true, data: [...this.rules] };
  }

  @Get('rules/search')
  searchAlertRules(
    @Query() q: ListAlertRulesQuery
  ): Result<PageResult<AlertRule>> {
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);

    let items = [...this.rules];
    if (q.keyword) {
      const kw = q.keyword.toLowerCase();
      items = items.filter((r) => r.name.toLowerCase().includes(kw));
    }
    if (q.enabled !== undefined) {
      const enabled = q.enabled === 'true';
      items = items.filter((r) => r.enabled === enabled);
    }
    if (q.type) {
      items = items.filter((r) => r.type === q.type);
    }

    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return {
      ok: true,
      data: {
        page,
        pageSize,
        total,
        items: paged,
      },
    };
  }

  @Get('channels')
  listAlertChannelConfigs(): Result<AlertChannelConfig[]> {
    return { ok: true, data: Array.from(this.channelConfigs.values()) };
  }

  @Post('channels')
  @HttpCode(HttpStatus.OK)
  upsertAlertChannelConfig(
    @Body() body: UpsertAlertChannelConfigBody
  ): Result<{ success: boolean }> {
    if (!body || typeof body !== 'object' || !('config' in body)) {
      return invalidArgument('Missing config');
    }
    const c = body.config as UpsertAlertChannelConfigBody['config'];
    if (!c || typeof c !== 'object')
      return invalidArgument('config is required');
    if (!c.channel || typeof c.channel !== 'string')
      return invalidArgument('config.channel is required');
    if (!allowedChannels.has(c.channel as AlertChannel))
      return invalidArgument('config.channel is invalid');
    if (typeof c.enabled !== 'boolean')
      return invalidArgument('config.enabled is required');
    if (!c.config || typeof c.config !== 'object')
      return invalidArgument('config.config is required');

    const updatedAt = nowIso() as ISODateTime;
    const full: AlertChannelConfig = {
      channel: c.channel as AlertChannel,
      enabled: c.enabled,
      config: c.config,
      updatedAt,
    };
    this.channelConfigs.set(full.channel, full);
    return { ok: true, data: { success: true } };
  }
}
