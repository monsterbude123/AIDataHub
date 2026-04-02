import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Post,
  Query,
} from '@nestjs/common';
import type {
  PageResult,
  Project,
  ProjectGroup,
  Result,
} from '@ai-datahub/contract';
import { SystemAdminStore } from './system-admin.store';

type CreateProjectBody = { project: Omit<Project, 'id'> };
type UpdateProjectBody = { project: Project };
type ListProjectsQuery = {
  page?: string;
  pageSize?: string;
  keyword?: string;
  orgId?: string;
};

type CreateProjectGroupBody = {
  group: Omit<ProjectGroup, 'id' | 'createdAt' | 'updatedAt'>;
};
type UpdateProjectGroupBody = {
  group: Omit<ProjectGroup, 'createdAt' | 'updatedAt'>;
};
type ListProjectGroupsQuery = {
  page?: string;
  pageSize?: string;
  keyword?: string;
  orgId?: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

@Controller('projects')
export class SystemAdminController {
  constructor(
    @Inject(SystemAdminStore) private readonly store: SystemAdminStore
  ) {}

  @Get()
  listProjects(@Query() q: ListProjectsQuery): Result<PageResult<Project>> {
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    let items = [...this.store.projects];
    if (q.orgId) items = items.filter((p) => p.orgId === q.orgId);
    if (q.keyword) {
      const kw = q.keyword.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(kw) || p.code.toLowerCase().includes(kw)
      );
    }
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items: paged } };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createProject(
    @Body() body: CreateProjectBody
  ): Result<{ projectId: string }> {
    const id = `p_${this.store.projects.length + 1}`;
    this.store.projects.push({ id, ...body.project });
    return { ok: true, data: { projectId: id } };
  }

  @Get(':id')
  getProject(@Param('id') id: string): Result<Project> {
    const p = this.store.projects.find((x) => x.id === id);
    if (!p) {
      return {
        ok: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: p };
  }

  @Put()
  updateProject(@Body() body: UpdateProjectBody): Result<{ success: boolean }> {
    const idx = this.store.projects.findIndex((p) => p.id === body.project.id);
    if (idx < 0) {
      return {
        ok: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
          level: 'ERROR',
        },
      };
    }
    this.store.projects[idx] = body.project;
    return { ok: true, data: { success: true } };
  }

  @Delete(':id')
  deleteProject(@Param('id') id: string): Result<{ success: boolean }> {
    const before = this.store.projects.length;
    this.store.projects = this.store.projects.filter((p) => p.id !== id);
    if (this.store.projects.length === before) {
      return {
        ok: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: { success: true } };
  }
}

@Controller('project-groups')
export class ProjectGroupsController {
  constructor(
    @Inject(SystemAdminStore) private readonly store: SystemAdminStore
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createProjectGroup(
    @Body() body: CreateProjectGroupBody
  ): Result<{ groupId: string }> {
    const id = `pg_${this.store.projectGroups.length + 1}`;
    const ts = nowIso();
    const group: ProjectGroup = {
      id,
      ...body.group,
      createdAt: ts,
      updatedAt: ts,
    };
    this.store.projectGroups.push(group);
    return { ok: true, data: { groupId: id } };
  }

  @Put()
  updateProjectGroup(
    @Body() body: UpdateProjectGroupBody
  ): Result<{ success: boolean }> {
    const idx = this.store.projectGroups.findIndex(
      (g) => g.id === body.group.id
    );
    if (idx < 0) {
      return {
        ok: false,
        error: {
          code: 'PROJECT_GROUP_NOT_FOUND',
          message: 'Project group not found',
          level: 'ERROR',
        },
      };
    }
    const existing = this.store.projectGroups[idx];
    this.store.projectGroups[idx] = {
      ...existing,
      ...body.group,
      updatedAt: nowIso(),
    };
    return { ok: true, data: { success: true } };
  }

  @Delete(':id')
  deleteProjectGroup(@Param('id') id: string): Result<{ success: boolean }> {
    const before = this.store.projectGroups.length;
    this.store.projectGroups = this.store.projectGroups.filter(
      (g) => g.id !== id
    );
    if (this.store.projectGroups.length === before) {
      return {
        ok: false,
        error: {
          code: 'PROJECT_GROUP_NOT_FOUND',
          message: 'Project group not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: { success: true } };
  }

  @Get()
  listProjectGroups(
    @Query() q: ListProjectGroupsQuery
  ): Result<PageResult<ProjectGroup>> {
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    let items = [...this.store.projectGroups];
    if (q.keyword) {
      const kw = q.keyword.toLowerCase();
      items = items.filter((g) => g.name.toLowerCase().includes(kw));
    }
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items: paged } };
  }

  @Post(':id/bind-projects')
  @HttpCode(HttpStatus.OK)
  bindProjectsToGroup(
    @Param('id') groupId: string,
    @Body() body: { projectIds: string[] }
  ): Result<{ success: boolean }> {
    this.store.groupProjects.set(groupId, [...body.projectIds]);
    return { ok: true, data: { success: true } };
  }

  @Post(':id/bind-users')
  @HttpCode(HttpStatus.OK)
  bindUsersToGroup(
    @Param('id') groupId: string,
    @Body() body: { userIds: string[] }
  ): Result<{ success: boolean }> {
    this.store.groupUsers.set(groupId, [...body.userIds]);
    return { ok: true, data: { success: true } };
  }
}
