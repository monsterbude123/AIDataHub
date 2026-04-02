import { ApiProperty } from '@nestjs/swagger';
import type { Organization } from '@ai-datahub/contract';

/**
 * 获取组织列表请求
 */
export class ListOrganizationsRequest {
  @ApiProperty({ description: '搜索关键字', required: false })
  keyword?: string = undefined;
}

/**
 * 创建组织请求 - 嵌套属性
 */
class CreateOrganizationData {
  @ApiProperty({ description: '组织名称' })
  name: string = undefined!;

  @ApiProperty({ description: '组织编码' })
  code: string = undefined!;

  @ApiProperty({ description: '父组织ID', required: false })
  parentId?: string;

  @ApiProperty({ description: '组织状态', required: false })
  status?: string;

  @ApiProperty({ description: '排序权重', required: false })
  sort?: number;
}

/**
 * 创建组织请求
 */
export class CreateOrganizationRequest {
  @ApiProperty({
    description: '组织信息',
    type: () => CreateOrganizationData,
    required: true,
  })
  org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'> = undefined!;
}

/**
 * 更新组织请求
 */
export class UpdateOrganizationRequest {
  @ApiProperty({
    description: '组织信息',
    type: 'object',
    required: true,
    additionalProperties: true,
  })
  org: Organization = undefined!;
}

/**
 * 删除组织请求
 */
export class DeleteOrganizationRequest {
  @ApiProperty({ description: '组织ID' })
  orgId: string = undefined!;
}
