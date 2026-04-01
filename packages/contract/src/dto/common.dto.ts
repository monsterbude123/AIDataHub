import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, IsString } from 'class-validator';

export class RequestMetaDto {
  @ApiPropertyOptional({ description: '链路追踪ID' })
  @IsOptional()
  @IsString()
  traceId?: string;

  @ApiPropertyOptional({ description: '幂等性Key' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiPropertyOptional({ description: '请求时间' })
  @IsOptional()
  @IsString()
  requestTime?: string;
}

export class PageRequestDto {
  @ApiProperty({ description: '页码（从1开始）', default: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({ description: '每页数量', default: 20, minimum: 1 })
  @IsNumber()
  @Min(1)
  pageSize: number = 20;
}

export class PageResultDto<T> {
  @ApiProperty({ description: '当前页码' })
  page: number;

  @ApiProperty({ description: '每页数量' })
  pageSize: number;

  @ApiProperty({ description: '总数量' })
  total: number;

  @ApiProperty({ description: '数据列表' })
  items: T[];
}

export class SuccessResultDto {
  @ApiProperty({ description: '是否成功', example: true })
  ok: true;
}

export class ErrorResultDto {
  @ApiProperty({ description: '是否成功', example: false })
  ok: false;

  @ApiProperty({ description: '错误信息' })
  error: {
    code: string;
    message: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
    details?: { field?: string; reason?: string; hint?: string }[];
    traceId?: string;
  };
}
