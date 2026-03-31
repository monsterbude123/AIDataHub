import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Query,
  Param,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import type { Result, Organization } from '@ai-datahub/contract';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly service: OrganizationService) {}

  @Get()
  listOrganizations(
    @Query('keyword') keyword?: string
  ): Promise<Result<Organization[]>> {
    return this.service.listOrganizations({ keyword });
  }

  @Post()
  createOrganization(
    @Body() body: { org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'> }
  ): Promise<Result<{ orgId: string }>> {
    return this.service.createOrganization(body);
  }

  @Put()
  updateOrganization(
    @Body() body: { org: Organization }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateOrganization(body);
  }

  @Delete('/:id')
  deleteOrganization(
    @Param('id') id: string
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteOrganization({ orgId: id });
  }
}
