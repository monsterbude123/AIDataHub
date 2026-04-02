import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  okResult,
  errResult,
  type Result,
  type MetadataVersion,
  type MetadataVersionDiff,
  type PageResult,
  type GetMetadataVersionsRequest,
  type CompareMetadataVersionsRequest,
  type ID,
  type SdkError,
} from '@ai-datahub/contract';

@Injectable()
export class MetadataVersionService {
  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {}

  async getMetadataVersions(
    req: GetMetadataVersionsRequest
  ): Promise<Result<PageResult<MetadataVersion>>> {
    const page = req.page?.page ?? 1;
    const pageSize = req.page?.pageSize ?? 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [items, total] = await Promise.all([
      this.prisma.metadataVersion.findMany({
        where: { dataAssetId: req.dataAssetId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.metadataVersion.count({
        where: { dataAssetId: req.dataAssetId },
      }),
    ]);

    return okResult(
      {
        page,
        pageSize,
        total,
        items: items.map(
          (v: {
            id: string;
            dataAssetId: string;
            version: string;
            createdAt: Date;
            createdBy?: string;
            summary?: string;
          }) => ({
            id: v.id,
            dataAssetId: v.dataAssetId,
            version: v.version,
            createdAt: v.createdAt.toISOString(),
            createdBy: v.createdBy ?? undefined,
            summary: v.summary ?? undefined,
          })
        ),
      },
      req.meta?.traceId
    );
  }

  async compareMetadataVersions(
    req: CompareMetadataVersionsRequest
  ): Promise<Result<{ diffs: MetadataVersionDiff[] }>> {
    const [left, right] = await Promise.all([
      this.prisma.metadataVersion.findUnique({
        where: { id: req.leftVersionId },
      }),
      this.prisma.metadataVersion.findUnique({
        where: { id: req.rightVersionId },
      }),
    ]);

    if (!left || !right) {
      const error: SdkError = {
        code: 'VERSION_NOT_FOUND',
        message: 'Version not found',
        level: 'ERROR',
      };
      return errResult(error, req.meta?.traceId);
    }

    const diffs: MetadataVersionDiff[] = [];

    // Compare version field
    if (left.version !== right.version) {
      diffs.push({
        field: 'version',
        left: left.version,
        right: right.version,
        changeType: 'MODIFIED',
      });
    }

    // Compare summary field
    if (left.summary !== right.summary) {
      diffs.push({
        field: 'summary',
        left: left.summary ?? undefined,
        right: right.summary ?? undefined,
        changeType:
          left.summary === undefined
            ? 'ADDED'
            : right.summary === undefined
              ? 'REMOVED'
              : 'MODIFIED',
      });
    }

    // Compare createdBy
    if (left.createdBy !== right.createdBy) {
      diffs.push({
        field: 'createdBy',
        left: left.createdBy ?? undefined,
        right: right.createdBy ?? undefined,
        changeType:
          left.createdBy === undefined
            ? 'ADDED'
            : right.createdBy === undefined
              ? 'REMOVED'
              : 'MODIFIED',
      });
    }

    return okResult({ diffs }, req.meta?.traceId);
  }

  async createMetadataVersion(req: {
    version: Omit<MetadataVersion, 'id' | 'createdAt'>;
  }): Promise<{ id: ID }> {
    const created = await this.prisma.metadataVersion.create({
      data: {
        dataAssetId: req.version.dataAssetId,
        version: req.version.version,
        createdBy: req.version.createdBy,
        summary: req.version.summary,
      },
    });

    return { id: created.id };
  }

  async findById(id: ID): Promise<MetadataVersion | null> {
    const version = await this.prisma.metadataVersion.findUnique({
      where: { id },
    });

    if (!version) {
      return null;
    }

    return {
      id: version.id,
      dataAssetId: version.dataAssetId,
      version: version.version,
      createdAt: version.createdAt.toISOString(),
      createdBy: version.createdBy ?? undefined,
      summary: version.summary ?? undefined,
    };
  }
}
