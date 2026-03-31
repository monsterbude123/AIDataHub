import 'reflect-metadata';
import {
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from 'vitest';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { OrganizationService } from '../src/modules/organization/organization.service';
import { UserService } from '../src/modules/user/user.service';
import { RoleService } from '../src/modules/role/role.service';
import { PermissionService } from '../src/modules/permission/permission.service';
import { MenuService } from '../src/modules/menu/menu.service';
import { DirectoryService } from '../src/modules/directory/directory.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { ApprovalTemplateService } from '../src/modules/approval-template/approval-template.service';
import { ApprovalService } from '../src/modules/approval/approval.service';
import { DataPermissionService } from '../src/modules/data-permission/data-permission.service';
import { CaslAbilityFactory } from '../src/modules/auth/casl-ability.factory';

import { OrganizationEntity } from '../src/entities/Organization.entity';
import { UserEntity } from '../src/entities/User.entity';
import { RoleEntity } from '../src/entities/Role.entity';
import { PermissionEntity } from '../src/entities/Permission.entity';
import { UserRoleEntity } from '../src/entities/UserRole.entity';
import { RolePermissionEntity } from '../src/entities/RolePermission.entity';
import { MenuNodeEntity } from '../src/entities/MenuNode.entity';
import { DirectoryTreeNodeEntity } from '../src/entities/DirectoryTreeNode.entity';
import { ApprovalTemplateEntity } from '../src/entities/ApprovalTemplate.entity';
import { ApprovalEntity } from '../src/entities/Approval.entity';
import { DataPermissionEntity } from '../src/entities/DataPermission.entity';

describe('system-auth-service E2E tests', () => {
  let dataSource: DataSource;
  let organizationService: OrganizationService;
  let userService: UserService;
  let roleService: RoleService;
  let permissionService: PermissionService;
  let menuService: MenuService;
  let directoryService: DirectoryService;
  let authService: AuthService;
  let approvalTemplateService: ApprovalTemplateService;
  let approvalService: ApprovalService;
  let dataPermissionService: DataPermissionService;

  let testOrgId: string;
  let testUserId: string;
  let testRoleId: string;
  let testPermissionId: string;

  const entities = [
    OrganizationEntity,
    UserEntity,
    RoleEntity,
    PermissionEntity,
    UserRoleEntity,
    RolePermissionEntity,
    MenuNodeEntity,
    DirectoryTreeNodeEntity,
    ApprovalTemplateEntity,
    ApprovalEntity,
    DataPermissionEntity,
  ];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities,
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature(entities),
      ],
      providers: [
        OrganizationService,
        UserService,
        RoleService,
        PermissionService,
        MenuService,
        DirectoryService,
        AuthService,
        ApprovalTemplateService,
        ApprovalService,
        DataPermissionService,
        CaslAbilityFactory,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    organizationService = moduleRef.get(OrganizationService);
    userService = moduleRef.get(UserService);
    roleService = moduleRef.get(RoleService);
    permissionService = moduleRef.get(PermissionService);
    menuService = moduleRef.get(MenuService);
    directoryService = moduleRef.get(DirectoryService);
    authService = moduleRef.get(AuthService);
    approvalTemplateService = moduleRef.get(ApprovalTemplateService);
    approvalService = moduleRef.get(ApprovalService);
    dataPermissionService = moduleRef.get(DataPermissionService);
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
  });

  const cleanDatabase = async () => {
    await dataSource.dropDatabase();
    await dataSource.synchronize(true);
  };

  const seedBasicData = async () => {
    const orgRepo = dataSource.getRepository(OrganizationEntity);
    const org = orgRepo.create({
      name: 'Test Organization',
      code: 'test-org',
      status: 'ENABLED',
    });
    await orgRepo.save(org);
    testOrgId = org.id;

    const roleRepo = dataSource.getRepository(RoleEntity);
    const role = roleRepo.create({
      name: 'Test Role',
      code: 'test-role',
      enabled: true,
    });
    await roleRepo.save(role);
    testRoleId = role.id;

    const permRepo = dataSource.getRepository(PermissionEntity);
    const perm = permRepo.create({
      type: 'URI',
      name: 'Test Permission',
      code: 'test-perm',
      resource: '/api/test',
    });
    await permRepo.save(perm);
    testPermissionId = perm.id;

    const userRepo = dataSource.getRepository(UserEntity);
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = userRepo.create({
      username: 'testuser',
      passwordHash,
      realName: 'Test User',
      orgId: testOrgId,
      status: 'ENABLED',
    });
    await userRepo.save(user);
    testUserId = user.id;

    const userRoleRepo = dataSource.getRepository(UserRoleEntity);
    const userRole = userRoleRepo.create({
      userId: testUserId,
      roleId: testRoleId,
    });
    await userRoleRepo.save(userRole);

    const templateRepo = dataSource.getRepository(ApprovalTemplateEntity);
    const template = templateRepo.create({
      businessType: 'test-business',
      name: 'Test Approval Template',
      definition: { nodes: [{ approverRole: 'test-role' }] },
    });
    await templateRepo.save(template);
  };

  describe('Organizations', () => {
    beforeEach(cleanDatabase);
    afterEach(cleanDatabase);

    it('should create an organization', async () => {
      const result = await organizationService.createOrganization({
        org: { name: 'New Org', code: 'new-org', status: 'ENABLED' },
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.orgId).toBeDefined();
      }
    });

    it('should reject duplicate code', async () => {
      await organizationService.createOrganization({
        org: { name: 'Org 1', code: 'dup-code', status: 'ENABLED' },
      });
      const result = await organizationService.createOrganization({
        org: { name: 'Org 2', code: 'dup-code', status: 'ENABLED' },
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('INVALID_ARGUMENT');
      }
    });

    it('should list organizations', async () => {
      await organizationService.createOrganization({
        org: { name: 'List Org', code: 'list-org', status: 'ENABLED' },
      });
      const result = await organizationService.listOrganizations({});
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });

    it('should update an organization', async () => {
      const createRes = await organizationService.createOrganization({
        org: { name: 'Update Org', code: 'update-org', status: 'ENABLED' },
      });
      expect(createRes.ok).toBe(true);
      if (!createRes.ok) return;
      const orgId = createRes.data.orgId;
      const result = await organizationService.updateOrganization({
        org: {
          id: orgId,
          name: 'Updated',
          code: 'update-org',
          status: 'DISABLED',
        },
      });
      expect(result.ok).toBe(true);
    });

    it('should delete an organization', async () => {
      const createRes = await organizationService.createOrganization({
        org: { name: 'Delete Org', code: 'delete-org', status: 'ENABLED' },
      });
      expect(createRes.ok).toBe(true);
      if (!createRes.ok) return;
      const result = await organizationService.deleteOrganization({
        orgId: createRes.data.orgId,
      });
      expect(result.ok).toBe(true);
    });

    it('should be idempotent when deleting non-existent organization', async () => {
      const result = await organizationService.deleteOrganization({
        orgId: 'non-existent',
      });
      expect(result.ok).toBe(true);
    });
  });

  describe('Users', () => {
    beforeEach(async () => {
      await cleanDatabase();
      await seedBasicData();
    });
    afterEach(cleanDatabase);

    it('should create a user', async () => {
      const result = await userService.createUser({
        user: { username: 'newuser', orgId: testOrgId, status: 'ENABLED' },
      });
      expect(result.ok).toBe(true);
    });

    it('should reject duplicate username', async () => {
      const result = await userService.createUser({
        user: { username: 'testuser', orgId: testOrgId, status: 'ENABLED' },
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('USERNAME_DUPLICATE');
      }
    });

    it('should list users with pagination', async () => {
      const result = await userService.listUsers({
        page: { page: 1, pageSize: 10 },
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.page).toBe(1);
        expect(Array.isArray(result.data.items)).toBe(true);
      }
    });

    it('should update a user', async () => {
      const result = await userService.updateUser({
        user: {
          id: testUserId,
          username: 'testuser',
          orgId: testOrgId,
          status: 'ENABLED',
        },
      });
      expect(result.ok).toBe(true);
    });

    it('should delete a user', async () => {
      const result = await userService.deleteUser({ userId: testUserId });
      expect(result.ok).toBe(true);
    });

    it('should assign roles to user', async () => {
      const result = await userService.assignRoles({
        userId: testUserId,
        roleIds: [testRoleId],
      });
      expect(result.ok).toBe(true);
    });
  });

  describe('Roles', () => {
    beforeEach(cleanDatabase);
    afterEach(cleanDatabase);

    it('should create a role', async () => {
      const result = await roleService.createRole({
        role: { name: 'Admin', code: 'admin', permissions: [] },
      });
      expect(result.ok).toBe(true);
    });

    it('should list roles', async () => {
      await roleService.createRole({
        role: { name: 'Viewer', code: 'viewer', permissions: [] },
      });
      const result = await roleService.listRoles({});
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });

    it('should update a role', async () => {
      const createRes = await roleService.createRole({
        role: { name: 'Updater', code: 'updater', permissions: [] },
      });
      expect(createRes.ok).toBe(true);
      if (!createRes.ok) return;
      const roleId = createRes.data.roleId;
      const result = await roleService.updateRole({
        role: { id: roleId, name: 'Updated', code: 'updater', permissions: [] },
      });
      expect(result.ok).toBe(true);
    });

    it('should delete a role', async () => {
      const createRes = await roleService.createRole({
        role: { name: 'Deleter', code: 'deleter', permissions: [] },
      });
      expect(createRes.ok).toBe(true);
      if (!createRes.ok) return;
      const result = await roleService.deleteRole({
        roleId: createRes.data.roleId,
      });
      expect(result.ok).toBe(true);
    });
  });

  describe('Permissions', () => {
    beforeEach(async () => {
      await cleanDatabase();
      await seedBasicData();
    });
    afterEach(cleanDatabase);

    it('should create a permission', async () => {
      const result = await permissionService.createPermission({
        permission: {
          type: 'URI',
          name: 'Read',
          code: 'read',
          resource: '/api',
        },
      });
      expect(result.ok).toBe(true);
    });

    it('should list permissions', async () => {
      const result = await permissionService.listPermissions({
        page: { page: 1, pageSize: 10 },
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.data.items)).toBe(true);
      }
    });

    it('should bind permissions to role', async () => {
      const result = await permissionService.bindPermissionsToRole({
        roleId: testRoleId,
        permissionIds: [testPermissionId],
      });
      expect(result.ok).toBe(true);
    });
  });

  describe('Menu', () => {
    beforeEach(cleanDatabase);
    afterEach(cleanDatabase);

    it('should return empty tree', async () => {
      const result = await menuService.listMenuTree({});
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });

    it('should create a menu node', async () => {
      const result = await menuService.upsertMenuNode({
        node: { type: 'MENU', name: 'Dashboard', enabled: true },
      });
      expect(result.ok).toBe(true);
    });

    it('should delete a menu node', async () => {
      const createRes = await menuService.upsertMenuNode({
        node: { type: 'BUTTON', name: 'Delete', enabled: true },
      });
      expect(createRes.ok).toBe(true);
      if (!createRes.ok) return;
      const result = await menuService.deleteMenuNode({
        nodeId: createRes.data.nodeId,
      });
      expect(result.ok).toBe(true);
    });
  });

  describe('Directory', () => {
    beforeEach(cleanDatabase);
    afterEach(cleanDatabase);

    it('should return empty tree', async () => {
      const result = await directoryService.listDirectoryTree({});
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });

    it('should create a node', async () => {
      const result = await directoryService.upsertDirectoryNode({
        node: { name: 'Root', code: 'root' },
      });
      expect(result.ok).toBe(true);
    });

    it('should delete a node', async () => {
      const createRes = await directoryService.upsertDirectoryNode({
        node: { name: 'Delete', code: 'delete' },
      });
      expect(createRes.ok).toBe(true);
      if (!createRes.ok) return;
      const result = await directoryService.deleteDirectoryNode({
        nodeId: createRes.data.nodeId,
      });
      expect(result.ok).toBe(true);
    });
  });

  describe('Auth', () => {
    beforeEach(async () => {
      await cleanDatabase();
      await seedBasicData();
    });
    afterEach(cleanDatabase);

    it('should return token for valid credentials', async () => {
      const result = await authService.login({
        username: 'testuser',
        password: 'password123',
      });
      expect(result.token).toBeDefined();
      expect(result.user.username).toBe('testuser');
    });

    it('should fail for invalid credentials', async () => {
      await expect(
        authService.login({
          username: 'wrong',
          password: 'wrong',
        })
      ).rejects.toThrow();
    });
  });

  describe('Approval Templates', () => {
    beforeEach(cleanDatabase);
    afterEach(cleanDatabase);

    it('should create a template', async () => {
      const result = await approvalTemplateService.createApprovalTemplate({
        template: { businessType: 'test', name: 'Test', definition: {} },
      });
      expect(result.ok).toBe(true);
    });

    it('should list templates', async () => {
      await approvalTemplateService.createApprovalTemplate({
        template: { businessType: 'test', name: 'Test', definition: {} },
      });
      const result = await approvalTemplateService.listApprovalTemplates({});
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });

    it('should update a template', async () => {
      const createRes = await approvalTemplateService.createApprovalTemplate({
        template: { businessType: 'test', name: 'Test', definition: {} },
      });
      expect(createRes.ok).toBe(true);
      if (!createRes.ok) return;
      const templateId = createRes.data.templateId;
      const result = await approvalTemplateService.updateApprovalTemplate({
        template: {
          id: templateId,
          businessType: 'test',
          name: 'Updated',
          definition: {},
        },
      });
      expect(result.ok).toBe(true);
    });

    it('should delete a template', async () => {
      const createRes = await approvalTemplateService.createApprovalTemplate({
        template: { businessType: 'test', name: 'Test', definition: {} },
      });
      expect(createRes.ok).toBe(true);
      if (!createRes.ok) return;
      const result = await approvalTemplateService.deleteApprovalTemplate({
        templateId: createRes.data.templateId,
      });
      expect(result.ok).toBe(true);
    });
  });

  describe('Approvals', () => {
    beforeEach(async () => {
      await cleanDatabase();
      await seedBasicData();
    });
    afterEach(cleanDatabase);

    it('should create an approval', async () => {
      const result = await approvalService.createApproval({
        businessType: 'test-business',
        businessId: 'biz-1',
        title: 'Test',
        applicantId: testUserId,
      });
      expect(result.ok).toBe(true);
    });

    it('should fail without template', async () => {
      await expect(
        approvalService.createApproval({
          businessType: 'no-template',
          businessId: 'biz-1',
          title: 'Test',
          applicantId: testUserId,
        })
      ).rejects.toThrow('No approval template found');
    });

    it('should list pending approvals', async () => {
      await approvalService.createApproval({
        businessType: 'test-business',
        businessId: 'biz-1',
        title: 'Test',
        applicantId: testUserId,
      });
      const result = await approvalService.listMyTodoApprovals({
        userId: testUserId,
        page: { page: 1, pageSize: 10 },
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.data.items)).toBe(true);
      }
    });

    it('should approve', async () => {
      const createRes = await approvalService.createApproval({
        businessType: 'test-business',
        businessId: 'biz-1',
        title: 'Test',
        applicantId: testUserId,
      });
      expect(createRes.ok).toBe(true);
      if (!createRes.ok) return;
      const approvalId = createRes.data.approvalId;
      const result = await approvalService.approve({
        approvalId,
        action: 'APPROVE',
        approverId: testUserId,
      });
      expect(result.ok).toBe(true);
    });

    it('should send reminder', async () => {
      const createRes = await approvalService.createApproval({
        businessType: 'test-business',
        businessId: 'biz-1',
        title: 'Test',
        applicantId: testUserId,
      });
      expect(createRes.ok).toBe(true);
      if (!createRes.ok) return;
      const result = await approvalService.remindApproval({
        approvalId: createRes.data.approvalId,
      });
      expect(result.ok).toBe(true);
    });
  });

  describe('Data Permissions', () => {
    beforeEach(async () => {
      await cleanDatabase();
      await seedBasicData();
    });
    afterEach(cleanDatabase);

    it('should create a data permission', async () => {
      const result = await dataPermissionService.upsertDataPermission({
        permission: { roleId: testRoleId, scope: { level: 'read' } },
      });
      expect(result.ok).toBe(true);
    });

    it('should list permissions', async () => {
      await dataPermissionService.upsertDataPermission({
        permission: { roleId: testRoleId, scope: { level: 'read' } },
      });
      const result = await dataPermissionService.listDataPermissions({
        roleId: testRoleId,
        page: { page: 1, pageSize: 10 },
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.data.items)).toBe(true);
      }
    });
  });

  describe('Result<T> pattern tests', () => {
    beforeEach(cleanDatabase);
    afterEach(cleanDatabase);

    it('Success results should match Result<T> pattern', async () => {
      const result = await organizationService.createOrganization({
        org: { name: 'Test', code: 'test-code', status: 'ENABLED' },
      });
      expect(result).toHaveProperty('ok', true);
      expect(result).toHaveProperty('data');
      expect(result).not.toHaveProperty('error');
    });

    it('Error results should match Result<T> pattern', async () => {
      await organizationService.createOrganization({
        org: { name: 'Org 1', code: 'dup-pattern', status: 'ENABLED' },
      });
      const result = await organizationService.createOrganization({
        org: { name: 'Org 2', code: 'dup-pattern', status: 'ENABLED' },
      });
      expect(result).toHaveProperty('ok', false);
      expect(result).toHaveProperty('error');
      if (!result.ok) {
        expect(result.error).toHaveProperty('code');
        expect(result.error).toHaveProperty('message');
      }
    });
  });
});
