import { describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from '../src/AppModule';

describe('admin-service (e2e)', () => {
  it('should return 401 when force auth and missing token', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    const res = await app.inject({
      method: 'GET',
      url: '/projects',
      headers: { 'x-require-auth': 'true' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().message).toContain('Authorization header missing');

    await app.close();
  });

  it('GET /health should return ok Result', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toEqual({ ok: true, data: { service: 'admin-service' } });

    await app.close();
  });

  it('GET /projects should be available (RED)', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    const res = await app.inject({ method: 'GET', url: '/projects' });
    expect(res.statusCode).toBe(200);

    await app.close();
  });

  it('should CRUD projects and project-groups with pagination/filtering', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    // create project
    const create = await app.inject({
      method: 'POST',
      url: '/projects',
      payload: {
        project: {
          name: 'p1',
          code: 'p1',
          orgId: 'org_1',
          status: 'ENABLED',
        },
      },
    });
    expect(create.statusCode).toBe(201);
    const createBody = create.json();
    expect(createBody.ok).toBe(true);
    const projectId = createBody.data.projectId as string;
    expect(typeof projectId).toBe('string');

    // list projects (pagination + keyword)
    const list = await app.inject({
      method: 'GET',
      url: '/projects?page=1&pageSize=10&keyword=p1',
    });
    expect(list.statusCode).toBe(200);
    const listBody = list.json();
    expect(listBody.ok).toBe(true);
    expect(listBody.data.total).toBeGreaterThan(0);
    expect(listBody.data.items[0].id).toBe(projectId);

    // update project
    const update = await app.inject({
      method: 'PUT',
      url: '/projects',
      payload: {
        project: {
          id: projectId,
          name: 'p1-updated',
          code: 'p1',
          orgId: 'org_1',
          status: 'ENABLED',
        },
      },
    });
    expect(update.statusCode).toBe(200);
    const updateBody = update.json();
    expect(updateBody.ok).toBe(true);
    expect(updateBody.data.success).toBe(true);

    // create project group
    const createGroup = await app.inject({
      method: 'POST',
      url: '/project-groups',
      payload: { group: { name: 'g1', description: 'd' } },
    });
    expect(createGroup.statusCode).toBe(201);
    const groupBody = createGroup.json();
    expect(groupBody.ok).toBe(true);
    const groupId = groupBody.data.groupId as string;

    // bind project to group
    const bindProjects = await app.inject({
      method: 'POST',
      url: `/project-groups/${groupId}/bind-projects`,
      payload: { projectIds: [projectId] },
    });
    expect(bindProjects.statusCode).toBe(200);
    const bindBody = bindProjects.json();
    expect(bindBody.ok).toBe(true);
    expect(bindBody.data.success).toBe(true);

    // list project groups
    const listGroups = await app.inject({
      method: 'GET',
      url: '/project-groups?page=1&pageSize=10&keyword=g1',
    });
    expect(listGroups.statusCode).toBe(200);
    const listGroupsBody = listGroups.json();
    expect(listGroupsBody.ok).toBe(true);
    expect(listGroupsBody.data.total).toBe(1);
    expect(listGroupsBody.data.items[0].id).toBe(groupId);

    // delete project
    const delProject = await app.inject({
      method: 'DELETE',
      url: `/projects/${projectId}`,
    });
    expect(delProject.statusCode).toBe(200);
    const delProjectBody = delProject.json();
    expect(delProjectBody.ok).toBe(true);
    expect(delProjectBody.data.success).toBe(true);

    // update not found
    const updateNotFound = await app.inject({
      method: 'PUT',
      url: '/projects',
      payload: {
        project: {
          id: 'p_missing',
          name: 'missing',
          code: 'missing',
          orgId: 'org_1',
          status: 'ENABLED',
        },
      },
    });
    expect(updateNotFound.statusCode).toBe(200);
    const unfBody = updateNotFound.json();
    expect(unfBody.ok).toBe(false);
    expect(unfBody.error.code).toBe('PROJECT_NOT_FOUND');

    // delete not found
    const deleteNotFound = await app.inject({
      method: 'DELETE',
      url: `/projects/p_missing2`,
    });
    expect(deleteNotFound.statusCode).toBe(200);
    const dnfBody = deleteNotFound.json();
    expect(dnfBody.ok).toBe(false);
    expect(dnfBody.error.code).toBe('PROJECT_NOT_FOUND');

    // bind users to group
    const bindUsers = await app.inject({
      method: 'POST',
      url: `/project-groups/${groupId}/bind-users`,
      payload: { userIds: ['u_1', 'u_2'] },
    });
    expect(bindUsers.statusCode).toBe(200);
    const buBody = bindUsers.json();
    expect(buBody.ok).toBe(true);
    expect(buBody.data.success).toBe(true);

    await app.close();
  });

  it('should support getProject and functions/drivers/packages/logs/tickets (MVP)', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    // create project
    const create = await app.inject({
      method: 'POST',
      url: '/projects',
      payload: {
        project: {
          name: 'p2',
          code: 'p2',
          orgId: 'org_1',
          status: 'ENABLED',
        },
      },
    });
    expect(create.statusCode).toBe(201);
    const projectId = create.json().data.projectId as string;

    // get project
    const get = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}`,
    });
    expect(get.statusCode).toBe(200);
    const getBody = get.json();
    expect(getBody.ok).toBe(true);
    expect(getBody.data.id).toBe(projectId);

    // functions CRUD (minimal)
    const createFunc = await app.inject({
      method: 'POST',
      url: '/functions',
      payload: {
        func: {
          category: 'c',
          name: 'f1',
          parameters: [],
        },
      },
    });
    expect(createFunc.statusCode).toBe(201);
    const funcId = createFunc.json().data.functionId as string;

    const listFuncs = await app.inject({
      method: 'GET',
      url: '/functions?page=1&pageSize=10&keyword=f1',
    });
    expect(listFuncs.statusCode).toBe(200);
    expect(listFuncs.json().ok).toBe(true);

    const getFunc = await app.inject({
      method: 'GET',
      url: `/functions/${funcId}`,
    });
    expect(getFunc.statusCode).toBe(200);
    expect(getFunc.json().ok).toBe(true);

    const updateFunc = await app.inject({
      method: 'PUT',
      url: '/functions',
      payload: {
        func: {
          id: funcId,
          category: 'c',
          name: 'f1-updated',
          parameters: [],
        },
      },
    });
    expect(updateFunc.statusCode).toBe(200);
    expect(updateFunc.json().ok).toBe(true);

    const delFunc = await app.inject({
      method: 'DELETE',
      url: `/functions/${funcId}`,
    });
    expect(delFunc.statusCode).toBe(200);
    expect(delFunc.json().ok).toBe(true);

    // drivers CRUD (minimal)
    const createDriver = await app.inject({
      method: 'POST',
      url: '/drivers',
      payload: { driver: { name: 'd1', version: '1.0.0', artifactRef: 'a' } },
    });
    expect(createDriver.statusCode).toBe(201);
    const driverId = createDriver.json().data.driverId as string;

    const listDrivers = await app.inject({
      method: 'GET',
      url: '/drivers?page=1&pageSize=10',
    });
    expect(listDrivers.statusCode).toBe(200);
    expect(listDrivers.json().ok).toBe(true);

    const delDriver = await app.inject({
      method: 'DELETE',
      url: `/drivers/${driverId}`,
    });
    expect(delDriver.statusCode).toBe(200);
    expect(delDriver.json().ok).toBe(true);

    // packages CRUD (minimal)
    const createPkg = await app.inject({
      method: 'POST',
      url: '/packages',
      payload: { pkg: { name: 'pkg1', version: '0.0.1', artifactRef: 'r' } },
    });
    expect(createPkg.statusCode).toBe(201);
    const pkgId = createPkg.json().data.packageId as string;

    const listPkgs = await app.inject({
      method: 'GET',
      url: '/packages?page=1&pageSize=10&keyword=pkg1',
    });
    expect(listPkgs.statusCode).toBe(200);
    expect(listPkgs.json().ok).toBe(true);

    const delPkg = await app.inject({
      method: 'DELETE',
      url: `/packages/${pkgId}`,
    });
    expect(delPkg.statusCode).toBe(200);
    expect(delPkg.json().ok).toBe(true);

    // operation logs list (empty ok)
    const logs = await app.inject({
      method: 'GET',
      url: '/logs?page=1&pageSize=10',
    });
    expect(logs.statusCode).toBe(200);
    expect(logs.json().ok).toBe(true);

    // tickets (empty ok; update not found)
    const tickets = await app.inject({
      method: 'GET',
      url: '/tickets?page=1&pageSize=10&assigneeUserId=u_1',
    });
    expect(tickets.statusCode).toBe(200);
    expect(tickets.json().ok).toBe(true);

    const getTicketNotFound = await app.inject({
      method: 'GET',
      url: '/tickets/t_missing',
    });
    expect(getTicketNotFound.statusCode).toBe(200);
    expect(getTicketNotFound.json().ok).toBe(false);

    await app.close();
  });
});
