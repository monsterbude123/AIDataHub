import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  okResult,
  errResult,
  type Result,
  type DataAsset,
  type ColumnMetadata,
  type PageResult,
  type ID,
} from '@ai-datahub/contract';
import { MetadataServiceException } from '../../common/errors/metadata.exception';

@Injectable()
export class DataAssetService {
  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {}

  async createDataAsset(req: {
    dataAsset: Omit<DataAsset, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ dataAssetId: string }>> {
    // Check for duplicate code
    const existing = await this.prisma.dataAsset.findUnique({
      where: { code: req.dataAsset.code },
    });
    if (existing) {
      return errResult({
        code: 'DATA_ASSET_CODE_DUPLICATE',
        message: 'Data asset with this code already exists',
        level: 'ERROR',
      });
    }

    const dataAsset = await this.prisma.dataAsset.create({
      data: {
        name: req.dataAsset.name,
        code: req.dataAsset.code,
        dataSourceId: req.dataAsset.dataSourceId,
        type: req.dataAsset.type,
        layer: req.dataAsset.layer,
        description: req.dataAsset.description,
        ownerId: req.dataAsset.ownerId,
        securityLevel: req.dataAsset.securityLevel,
        securityCategory: req.dataAsset.securityCategory,
      },
    });

    return okResult({ dataAssetId: dataAsset.id });
  }

  async updateDataAsset(req: {
    dataAsset: Omit<DataAsset, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const existing = await this.prisma.dataAsset.findUnique({
      where: { id: req.dataAsset.id },
    });
    if (!existing) {
      throw new MetadataServiceException(
        'DATA_ASSET_NOT_FOUND',
        'Data asset not found'
      );
    }

    await this.prisma.dataAsset.update({
      where: { id: req.dataAsset.id },
      data: {
        name: req.dataAsset.name,
        code: req.dataAsset.code,
        dataSourceId: req.dataAsset.dataSourceId,
        type: req.dataAsset.type,
        layer: req.dataAsset.layer,
        description: req.dataAsset.description,
        ownerId: req.dataAsset.ownerId,
        securityLevel: req.dataAsset.securityLevel,
        securityCategory: req.dataAsset.securityCategory,
      },
    });

    return okResult({ success: true });
  }

  async getDataAssetById(id: ID): Promise<Result<DataAsset>> {
    const dataAsset = await this.prisma.dataAsset.findUnique({
      where: { id },
    });
    if (!dataAsset) {
      return errResult({
        code: 'DATA_ASSET_NOT_FOUND',
        message: `Data asset not found: ${id}`,
        level: 'ERROR',
      });
    }

    return okResult({
      id: dataAsset.id,
      name: dataAsset.name,
      code: dataAsset.code,
      dataSourceId: dataAsset.dataSourceId,
      type: dataAsset.type as DataAsset['type'],
      layer: dataAsset.layer as DataAsset['layer'],
      description: dataAsset.description ?? undefined,
      ownerId: dataAsset.ownerId ?? undefined,
      securityLevel: dataAsset.securityLevel ?? undefined,
      securityCategory: dataAsset.securityCategory ?? undefined,
      createdAt: dataAsset.createdAt.toISOString(),
      updatedAt: dataAsset.updatedAt.toISOString(),
    });
  }

  async searchDataAssets(req: {
    keyword?: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<DataAsset>>> {
    const skip = (req.page.page - 1) * req.page.pageSize;

    const where = req.keyword
      ? {
          OR: [
            { name: { contains: req.keyword } },
            { code: { contains: req.keyword } },
            { description: { contains: req.keyword } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.dataAsset.findMany({
        where,
        skip,
        take: req.page.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataAsset.count({ where }),
    ]);

    return okResult({
      page: req.page.page,
      pageSize: req.page.pageSize,
      total,
      items: items.map(
        (da: {
          id: string;
          name: string;
          code: string;
          dataSourceId: string;
          type: string;
          layer: string;
          description: string | null;
          ownerId: string | null;
          securityLevel: number | null;
          securityCategory: string | null;
          createdAt: Date;
          updatedAt: Date;
        }) => ({
          id: da.id,
          name: da.name,
          code: da.code,
          dataSourceId: da.dataSourceId,
          type: da.type as DataAsset['type'],
          layer: da.layer as DataAsset['layer'],
          description: da.description ?? undefined,
          ownerId: da.ownerId ?? undefined,
          securityLevel: da.securityLevel ?? undefined,
          securityCategory: da.securityCategory ?? undefined,
          createdAt: da.createdAt.toISOString(),
          updatedAt: da.updatedAt.toISOString(),
        })
      ),
    });
  }

  async createColumns(data: {
    columns: Array<Omit<ColumnMetadata, 'id'>>;
  }): Promise<{ ids: string[] }> {
    const ids: string[] = [];

    for (const col of data.columns) {
      const created = await this.prisma.columnMetadata.create({
        data: {
          dataAssetId: col.dataAssetId,
          name: col.name,
          code: col.code,
          dataType: col.dataType,
          precision: col.precision,
          scale: col.scale,
          description: col.description,
          isPrimaryKey: col.isPrimaryKey,
          standardDataElementId: col.standardDataElementId,
          dictionaryId: col.dictionaryId,
        },
      });
      ids.push(created.id);
    }

    return { ids };
  }

  async getColumnsByDataAssetId(dataAssetId: ID): Promise<ColumnMetadata[]> {
    const columns = await this.prisma.columnMetadata.findMany({
      where: { dataAssetId },
    });

    return columns.map(
      (c: {
        id: string;
        dataAssetId: string;
        name: string | null;
        code: string | null;
        dataType: string;
        precision: number | null;
        scale: number | null;
        description: string | null;
        isPrimaryKey: boolean | null;
        standardDataElementId: string | null;
        dictionaryId: string | null;
      }) => ({
        id: c.id,
        dataAssetId: c.dataAssetId,
        name: c.name,
        code: c.code ?? undefined,
        dataType: c.dataType,
        precision: c.precision ?? undefined,
        scale: c.scale ?? undefined,
        description: c.description ?? undefined,
        isPrimaryKey: c.isPrimaryKey ?? undefined,
        standardDataElementId: c.standardDataElementId ?? undefined,
        dictionaryId: c.dictionaryId ?? undefined,
      })
    );
  }

  async deleteColumnsByDataAssetId(dataAssetId: ID): Promise<void> {
    await this.prisma.columnMetadata.deleteMany({
      where: { dataAssetId },
    });
  }
}
