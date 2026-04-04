import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  okResult,
  errResult,
  type Result,
  type MetadataSource,
  type MetadataSourceListResult,
  type ListMetadataSourcesRequest,
  type CreateMetadataSourceRequest,
  type TestMetadataConnectionRequest,
  type DataSourceConnectionTest,
  type MetadataSourceConfig,
  type ID,
  type SdkError,
} from '@ai-datahub/contract';
import { ConnectorFactory } from '../../connectors';

@Injectable()
export class DataConnectionService {
  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {}

  async testConnection(
    req: TestMetadataConnectionRequest
  ): Promise<Result<DataSourceConnectionTest>> {
    try {
      const connector = ConnectorFactory.create(req.type);
      const config: MetadataSourceConfig = {
        type: req.type,
        host: req.host,
        port: req.port,
        username: req.username,
        password: req.password,
        database: req.database,
        ssl: req.ssl,
        extra: req.extra,
      };
      const result = await connector.testConnection(config);
      return okResult(result, req.meta?.traceId);
    } catch (error) {
      const err: SdkError = {
        code: 'CONNECTION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        level: 'ERROR',
      };
      return errResult(err, req.meta?.traceId);
    }
  }

  async createMetadataSource(
    req: CreateMetadataSourceRequest
  ): Promise<Result<MetadataSource>> {
    // Check if source with same name already exists
    const existing = await this.prisma.metadataSource.findFirst({
      where: { name: req.name },
    });
    if (existing) {
      return errResult({
        code: 'SOURCE_NAME_DUPLICATE',
        message: 'Metadata source with this name already exists',
        level: 'ERROR',
      });
    }

    const now = new Date().toISOString();
    const source = await this.prisma.metadataSource.create({
      data: {
        name: req.name,
        type: req.type,
        host: req.host,
        port: req.port,
        username: req.username,
        passwordEncrypted: req.password, // TODO: encrypt in production
        database: req.database,
        ssl: req.ssl,
        extra: req.extra ? JSON.stringify(req.extra) : null,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
    });

    return okResult(
      {
        id: source.id,
        name: source.name,
        type: source.type,
        host: source.host,
        port: source.port,
        username: source.username,
        passwordEncrypted: source.passwordEncrypted,
        database: source.database,
        status: source.status as 'ACTIVE' | 'INACTIVE',
        createdAt: source.createdAt.toISOString(),
        updatedAt: source.updatedAt.toISOString(),
      },
      req.meta?.traceId
    );
  }

  async listMetadataSources(
    req: ListMetadataSourcesRequest
  ): Promise<Result<MetadataSourceListResult>> {
    const where: Record<string, unknown> = {};
    if (req.type) {
      where.type = req.type;
    }
    if (req.status) {
      where.status = req.status;
    }

    const total = await this.prisma.metadataSource.count({ where });
    const page = req.page ?? 1;
    const pageSize = req.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const items = await this.prisma.metadataSource.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    const result: MetadataSourceListResult = {
      items: items.map(
        (s: {
          id: string;
          name: string;
          type: string;
          host: string;
          port: number;
          username: string;
          passwordEncrypted: string;
          database: string | null;
          status: string;
          createdAt: Date;
          updatedAt: Date;
        }) => ({
          id: s.id,
          name: s.name,
          type: s.type as MetadataSource['type'],
          host: s.host,
          port: s.port,
          username: s.username,
          passwordEncrypted: s.passwordEncrypted,
          database: s.database ?? undefined,
          status: s.status as 'ACTIVE' | 'INACTIVE',
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
        })
      ),
      total,
      page,
      pageSize,
    };

    return okResult(result, req.meta?.traceId);
  }

  async getMetadataSourceById(id: ID): Promise<Result<MetadataSource>> {
    const source = await this.prisma.metadataSource.findUnique({
      where: { id },
    });
    if (!source) {
      const err: SdkError = {
        code: 'SOURCE_NOT_FOUND',
        message: `Metadata source not found: ${id}`,
        level: 'ERROR',
      };
      return errResult(err);
    }

    return okResult({
      id: source.id,
      name: source.name,
      type: source.type as MetadataSource['type'],
      host: source.host,
      port: source.port,
      username: source.username,
      passwordEncrypted: source.passwordEncrypted,
      database: source.database ?? undefined,
      status: source.status as 'ACTIVE' | 'INACTIVE',
      createdAt: source.createdAt.toISOString(),
      updatedAt: source.updatedAt.toISOString(),
    });
  }
}
