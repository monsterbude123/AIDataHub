import 'reflect-metadata';
import { describe, expect, it, beforeAll } from 'vitest';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
    realName?: string;
    orgId: string;
  };
  roles: string[];
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
}

async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return res.json() as Promise<ApiResponse<T>>;
}

async function fetchWithAuth<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return fetchApi<T>(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

describe('HTTP E2E Tests - Real API Calls', () => {
  let adminToken: string;
  let adminUserId: string;
  let adminOrgId: string;

  // Admin credentials from service startup
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'epdR4x>r(K4*_iz?';

  beforeAll(async () => {
    // Wait for service to be ready
    const health = await fetchApi<{ service: string }>('/health');
    expect(health.ok).toBe(true);

    // Login as admin - login endpoint returns direct data, not Result<T>
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
      }),
    });

    if (loginRes.ok) {
      const loginData = (await loginRes.json()) as LoginResponse;
      adminToken = loginData.token;
      adminUserId = loginData.user.id;
      adminOrgId = loginData.user.orgId;
    } else {
      throw new Error(`Failed to login: ${loginRes.status}`);
    }
  });

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: ADMIN_USERNAME,
          password: ADMIN_PASSWORD,
        }),
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        const data = (await res.json()) as LoginResponse;
        expect(data.token).toBeDefined();
        expect(data.user.username).toBe('admin');
        expect(data.roles).toContain('super-admin');
      }
    });

    it('should reject invalid credentials', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'wrongpassword',
        }),
      });

      expect(res.ok).toBe(false);
    });

    it('should reject missing credentials', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.ok).toBe(false);
    });
  });

  describe('Protected Endpoints (require auth)', () => {
    it('should reject requests without token', async () => {
      const res = await fetch(`${BASE_URL}/organizations`);
      expect(res.status).toBe(401);
    });

    it('should accept requests with valid token', async () => {
      const res = await fetchWithAuth('/organizations', adminToken);
      expect(res.ok).toBe(true);
    });
  });

  describe('Organizations API', () => {
    it('should list organizations', async () => {
      const res = await fetchWithAuth<
        { id: string; name: string; code: string }[]
      >('/organizations', adminToken);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(Array.isArray(res.data)).toBe(true);
        // Should have at least the default org
        expect(res.data?.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should create an organization', async () => {
      const res = await fetchWithAuth<{ orgId: string }>(
        '/organizations',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            org: {
              name: 'Test Org E2E',
              code: 'test-org-e2e',
              status: 'ENABLED',
            },
          }),
        }
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data?.orgId).toBeDefined();
      }
    });

    it('should reject duplicate org code', async () => {
      // Create first
      await fetchWithAuth<{ orgId: string }>('/organizations', adminToken, {
        method: 'POST',
        body: JSON.stringify({
          org: { name: 'Dup Org 1', code: 'dup-org-e2e', status: 'ENABLED' },
        }),
      });

      // Try duplicate
      const res = await fetchWithAuth('/organizations', adminToken, {
        method: 'POST',
        body: JSON.stringify({
          org: { name: 'Dup Org 2', code: 'dup-org-e2e', status: 'ENABLED' },
        }),
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error?.code).toBe('INVALID_ARGUMENT');
      }
    });

    it('should update an organization', async () => {
      // Create first
      const createRes = await fetchWithAuth<{ orgId: string }>(
        '/organizations',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            org: {
              name: 'Update Org',
              code: 'update-org-e2e',
              status: 'ENABLED',
            },
          }),
        }
      );

      expect(createRes.ok).toBe(true);
      if (!createRes.ok || !createRes.data) return;

      // Update
      const updateRes = await fetchWithAuth<{ success: boolean }>(
        '/organizations',
        adminToken,
        {
          method: 'PUT',
          body: JSON.stringify({
            org: {
              id: createRes.data.orgId,
              name: 'Updated Org Name',
              code: 'update-org-e2e',
              status: 'DISABLED',
            },
          }),
        }
      );

      expect(updateRes.ok).toBe(true);
    });

    it('should delete an organization', async () => {
      // Create first
      const createRes = await fetchWithAuth<{ orgId: string }>(
        '/organizations',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            org: {
              name: 'Delete Org',
              code: 'delete-org-e2e',
              status: 'ENABLED',
            },
          }),
        }
      );

      expect(createRes.ok).toBe(true);
      if (!createRes.ok || !createRes.data) return;

      // Delete
      const deleteRes = await fetchWithAuth<{ success: boolean }>(
        `/organizations/${createRes.data.orgId}`,
        adminToken,
        { method: 'DELETE' }
      );

      expect(deleteRes.ok).toBe(true);
    });
  });

  describe('Users API', () => {
    it('should list users with pagination', async () => {
      const res = await fetchWithAuth<{
        page: string | number;
        pageSize: string | number;
        total: number;
        items: unknown[];
      }>('/users?page=1&pageSize=10', adminToken);

      expect(res.ok).toBe(true);
      if (res.ok) {
        // Page query params are returned as strings
        expect([1, '1']).toContain(res.data?.page);
        expect(Array.isArray(res.data?.items)).toBe(true);
        // Should have admin user
        expect(res.data?.items?.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should create a user', async () => {
      const res = await fetchWithAuth<{ userId: string }>(
        '/users',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            user: {
              username: 'testuser-e2e',
              email: 'test@example.com',
              realName: 'Test User E2E',
              orgId: adminOrgId,
              status: 'ENABLED',
            },
          }),
        }
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data?.userId).toBeDefined();
      }
    });

    it('should reject duplicate username', async () => {
      // Create first
      await fetchWithAuth<{ userId: string }>('/users', adminToken, {
        method: 'POST',
        body: JSON.stringify({
          user: {
            username: 'dup-user-e2e',
            orgId: adminOrgId,
            status: 'ENABLED',
          },
        }),
      });

      // Try duplicate
      const res = await fetchWithAuth('/users', adminToken, {
        method: 'POST',
        body: JSON.stringify({
          user: {
            username: 'dup-user-e2e',
            orgId: adminOrgId,
            status: 'ENABLED',
          },
        }),
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error?.code).toBe('USERNAME_DUPLICATE');
      }
    });

    it('should assign roles to user', async () => {
      // Create a role first
      const roleRes = await fetchWithAuth<{ roleId: string }>(
        '/roles',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            role: { name: 'Test Role', code: `test-role-${Date.now()}` },
          }),
        }
      );

      expect(roleRes.ok).toBe(true);
      if (!roleRes.ok || !roleRes.data) return;

      // Assign role to admin user
      const assignRes = await fetchWithAuth<{ success: boolean }>(
        `/users/${adminUserId}/roles`,
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({ roleIds: [roleRes.data.roleId] }),
        }
      );

      expect(assignRes.ok).toBe(true);
    });
  });

  describe('Roles API', () => {
    it('should list roles', async () => {
      const res = await fetchWithAuth<
        { id: string; name: string; code: string }[]
      >('/roles', adminToken);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(Array.isArray(res.data)).toBe(true);
        // Should have super-admin role
        expect(res.data?.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should create a role', async () => {
      const res = await fetchWithAuth<{ roleId: string }>(
        '/roles',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            role: { name: 'New Role E2E', code: 'new-role-e2e' },
          }),
        }
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data?.roleId).toBeDefined();
      }
    });

    it('should update a role', async () => {
      // Create first
      const createRes = await fetchWithAuth<{ roleId: string }>(
        '/roles',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            role: { name: 'Update Role', code: 'update-role-e2e' },
          }),
        }
      );

      expect(createRes.ok).toBe(true);
      if (!createRes.ok || !createRes.data) return;

      // Update
      const updateRes = await fetchWithAuth<{ success: boolean }>(
        '/roles',
        adminToken,
        {
          method: 'PUT',
          body: JSON.stringify({
            role: {
              id: createRes.data.roleId,
              name: 'Updated Role',
              code: 'update-role-e2e',
            },
          }),
        }
      );

      expect(updateRes.ok).toBe(true);
    });

    it('should delete a role', async () => {
      // Create first
      const createRes = await fetchWithAuth<{ roleId: string }>(
        '/roles',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            role: { name: 'Delete Role', code: 'delete-role-e2e' },
          }),
        }
      );

      expect(createRes.ok).toBe(true);
      if (!createRes.ok || !createRes.data) return;

      // Delete
      const deleteRes = await fetchWithAuth<{ success: boolean }>(
        `/roles/${createRes.data.roleId}`,
        adminToken,
        { method: 'DELETE' }
      );

      expect(deleteRes.ok).toBe(true);
    });
  });

  describe('Permissions API', () => {
    it('should list permissions with pagination', async () => {
      const res = await fetchWithAuth<{ page: number; items: unknown[] }>(
        '/permissions?page=1&pageSize=20',
        adminToken
      );
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data?.page).toBe(1);
        expect(Array.isArray(res.data?.items)).toBe(true);
      }
    });

    it('should create a permission', async () => {
      const res = await fetchWithAuth<{ permissionId: string }>(
        '/permissions',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            permission: {
              type: 'URI',
              name: 'Test Permission E2E',
              code: `test-perm-${Date.now()}`,
              resource: '/api/test/e2e',
            },
          }),
        }
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data?.permissionId).toBeDefined();
      }
    });

    it('should bind permissions to role', async () => {
      const ts = Date.now();
      // Create role and permission
      const roleRes = await fetchWithAuth<{ roleId: string }>(
        '/roles',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            role: { name: 'Perm Role', code: `perm-role-${ts}` },
          }),
        }
      );

      const permRes = await fetchWithAuth<{ permissionId: string }>(
        '/permissions',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            permission: {
              type: 'URI',
              name: 'Bind Perm',
              code: `bind-perm-${ts}`,
              resource: '/api/bind',
            },
          }),
        }
      );

      expect(roleRes.ok).toBe(true);
      expect(permRes.ok).toBe(true);
      if (!roleRes.ok || !permRes.ok || !roleRes.data || !permRes.data) return;

      // Bind
      const bindRes = await fetchWithAuth<{ success: boolean }>(
        '/permissions/bind-to-role',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            roleId: roleRes.data.roleId,
            permissionIds: [permRes.data.permissionId],
          }),
        }
      );

      expect(bindRes.ok).toBe(true);
    });
  });

  describe('Menu API', () => {
    it('should return menu tree', async () => {
      const res = await fetchWithAuth<unknown[]>('/menu/tree', adminToken);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(Array.isArray(res.data)).toBe(true);
      }
    });

    it('should create a menu node', async () => {
      const res = await fetchWithAuth<{ nodeId: string }>(
        '/menu/upsert',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            node: {
              type: 'MENU',
              name: 'Test Menu E2E',
              path: '/test-menu',
              enabled: true,
            },
          }),
        }
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data?.nodeId).toBeDefined();
      }
    });

    it('should delete a menu node', async () => {
      // Create first
      const createRes = await fetchWithAuth<{ nodeId: string }>(
        '/menu/upsert',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            node: { type: 'BUTTON', name: 'Delete Menu', enabled: true },
          }),
        }
      );

      expect(createRes.ok).toBe(true);
      if (!createRes.ok || !createRes.data) return;

      // Delete
      const deleteRes = await fetchWithAuth<{ success: boolean }>(
        `/menu/${createRes.data.nodeId}`,
        adminToken,
        { method: 'DELETE' }
      );

      expect(deleteRes.ok).toBe(true);
    });
  });

  describe('Directory API', () => {
    it('should return directory tree', async () => {
      const res = await fetchWithAuth<unknown[]>('/directory/tree', adminToken);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(Array.isArray(res.data)).toBe(true);
      }
    });

    it('should create a directory node', async () => {
      const res = await fetchWithAuth<{ nodeId: string }>(
        '/directory/upsert',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            node: { name: 'Test Directory E2E', code: 'test-dir-e2e' },
          }),
        }
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data?.nodeId).toBeDefined();
      }
    });
  });

  describe('Approval Templates API', () => {
    it('should list templates', async () => {
      const res = await fetchWithAuth<unknown[]>(
        '/approval-templates',
        adminToken
      );
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(Array.isArray(res.data)).toBe(true);
      }
    });

    it('should create a template', async () => {
      const res = await fetchWithAuth<{ templateId: string }>(
        '/approval-templates',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            template: {
              businessType: 'test-business-e2e',
              name: 'Test Template E2E',
              definition: { nodes: [{ approverRole: 'super-admin' }] },
            },
          }),
        }
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data?.templateId).toBeDefined();
      }
    });
  });

  describe('Approvals API', () => {
    const bizType = `approval-test-${Date.now()}`;

    beforeAll(async () => {
      // Create a template for approvals
      await fetchWithAuth<{ templateId: string }>(
        '/approval-templates',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            template: {
              businessType: bizType,
              name: 'Approval Test Template',
              definition: { nodes: [{ approverRole: 'super-admin' }] },
            },
          }),
        }
      );
    });

    it('should list todo approvals', async () => {
      const res = await fetchWithAuth<{ items: unknown[] }>(
        `/approvals/todo?userId=${adminUserId}&page=1&pageSize=10`,
        adminToken
      );
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(Array.isArray(res.data?.items)).toBe(true);
      }
    });

    it('should list done approvals', async () => {
      const res = await fetchWithAuth<{ items: unknown[] }>(
        `/approvals/done?userId=${adminUserId}&page=1&pageSize=10`,
        adminToken
      );
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(Array.isArray(res.data?.items)).toBe(true);
      }
    });

    it('should create an approval', async () => {
      const res = await fetchWithAuth<{ approvalId: string }>(
        '/approvals',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            businessType: bizType,
            businessId: `test-biz-${Date.now()}`,
            title: 'Test Approval E2E',
            applicantId: adminUserId,
          }),
        }
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data?.approvalId).toBeDefined();
      }
    });
  });

  describe('Data Permissions API', () => {
    it('should create a data permission', async () => {
      const uniqueCode = `dp-role-${Date.now()}`;
      // Create a role first
      const roleRes = await fetchWithAuth<{ roleId: string }>(
        '/roles',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            role: { name: 'Data Perm Role', code: uniqueCode },
          }),
        }
      );

      expect(roleRes.ok).toBe(true);
      if (!roleRes.ok || !roleRes.data) return;

      const res = await fetchWithAuth<{ permissionId: string }>(
        '/data-permissions',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            permission: {
              roleId: roleRes.data.roleId,
              scope: { level: 'read' },
            },
          }),
        }
      );

      expect(res.ok).toBe(true);
    });

    it('should list data permissions for role', async () => {
      const uniqueCode = `dp-list-${Date.now()}`;
      // Create role and permission
      const roleRes = await fetchWithAuth<{ roleId: string }>(
        '/roles',
        adminToken,
        {
          method: 'POST',
          body: JSON.stringify({
            role: { name: 'DP List Role', code: uniqueCode },
          }),
        }
      );

      expect(roleRes.ok).toBe(true);
      if (!roleRes.ok || !roleRes.data) return;

      await fetchWithAuth('/data-permissions', adminToken, {
        method: 'POST',
        body: JSON.stringify({
          permission: {
            roleId: roleRes.data.roleId,
            scope: { level: 'write' },
          },
        }),
      });

      const res = await fetchWithAuth<{ items: unknown[] }>(
        `/data-permissions/role/${roleRes.data.roleId}?page=1&pageSize=10`,
        adminToken
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(Array.isArray(res.data?.items)).toBe(true);
      }
    });
  });

  describe('Health Check', () => {
    it('should return health status without auth', async () => {
      const res = await fetchApi<{ service: string }>('/health');
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data?.service).toBe('system-auth-service');
      }
    });
  });

  describe('Swagger Documentation', () => {
    it('should serve swagger UI without auth', async () => {
      const res = await fetch(`${BASE_URL}/api/docs`);
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('Swagger');
    });
  });
});
