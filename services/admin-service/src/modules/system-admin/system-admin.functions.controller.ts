import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Put,
  Post,
  Query,
} from '@nestjs/common';
import type { FunctionDef, PageResult, Result } from '@ai-datahub/contract';
import { SystemAdminStore } from './system-admin.store';

type PageQuery = { page?: string; pageSize?: string; keyword?: string };

type CreateFunctionBody = {
  func: Omit<FunctionDef, 'id' | 'createdAt' | 'updatedAt'>;
};
type UpdateFunctionBody = {
  func: Omit<FunctionDef, 'createdAt' | 'updatedAt'>;
};

function nowIso(): string {
  return new Date().toISOString();
}

function invalidArgument(message: string): Result<never> {
  return {
    ok: false,
    error: { code: 'INVALID_ARGUMENT', message, level: 'ERROR' },
  };
}

@Controller('functions')
export class FunctionsController {
  constructor(
    @Inject(SystemAdminStore) private readonly store: SystemAdminStore
  ) {}

  @Get()
  listFunctions(@Query() q: PageQuery): Result<PageResult<FunctionDef>> {
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    let items = [...this.store.functions];
    if (q.keyword) {
      const kw = q.keyword.toLowerCase();
      items = items.filter((f) => f.name.toLowerCase().includes(kw));
    }
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items: paged } };
  }

  @Get(':id')
  getFunction(@Param('id') id: string): Result<FunctionDef> {
    const f = this.store.functions.find((x) => x.id === id);
    if (!f) {
      return {
        ok: false,
        error: {
          code: 'FUNCTION_NOT_FOUND',
          message: 'Function not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: f };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createFunction(
    @Body() body: CreateFunctionBody
  ): Result<{ functionId: string }> {
    if (!body?.func) return invalidArgument('Missing func');
    if (!body.func.name) return invalidArgument('func.name is required');
    if (!body.func.category)
      return invalidArgument('func.category is required');
    if (!Array.isArray(body.func.parameters))
      return invalidArgument('func.parameters is required');
    const id = `fn_${this.store.functions.length + 1}`;
    const ts = nowIso();
    this.store.functions.push({
      id,
      ...body.func,
      createdAt: ts,
      updatedAt: ts,
    });
    return { ok: true, data: { functionId: id } };
  }

  @Put()
  updateFunction(
    @Body() body: UpdateFunctionBody
  ): Result<{ success: boolean }> {
    if (!body?.func) return invalidArgument('Missing func');
    if (!body.func.id) return invalidArgument('func.id is required');
    const idx = this.store.functions.findIndex((x) => x.id === body.func.id);
    if (idx < 0) {
      return {
        ok: false,
        error: {
          code: 'FUNCTION_NOT_FOUND',
          message: 'Function not found',
          level: 'ERROR',
        },
      };
    }
    const existing = this.store.functions[idx];
    this.store.functions[idx] = {
      ...existing,
      ...body.func,
      updatedAt: nowIso(),
    };
    return { ok: true, data: { success: true } };
  }

  @Delete(':id')
  deleteFunction(@Param('id') id: string): Result<{ success: boolean }> {
    const before = this.store.functions.length;
    this.store.functions = this.store.functions.filter((x) => x.id !== id);
    if (this.store.functions.length === before) {
      return {
        ok: false,
        error: {
          code: 'FUNCTION_NOT_FOUND',
          message: 'Function not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: { success: true } };
  }
}
