/**
 * 系统管理模块 Mock 数据
 */

import type { Organization, SystemUser } from "@/types/system";

/**
 * Mock 组织机构树
 */
export const mockOrganizations: Organization[] = [
  {
    id: "org-001",
    name: "集团总部",
    code: "HQ",
    order: 1,
    status: "enabled",
    children: [
      {
        id: "org-001-001",
        name: "技术部",
        code: "TECH",
        parentId: "org-001",
        leader: "张三",
        phone: "010-12345678",
        order: 1,
        status: "enabled",
        children: [
          {
            id: "org-001-001-001",
            name: "研发一组",
            code: "DEV1",
            parentId: "org-001-001",
            order: 1,
            status: "enabled",
          },
          {
            id: "org-001-001-002",
            name: "研发二组",
            code: "DEV2",
            parentId: "org-001-001",
            order: 2,
            status: "enabled",
          },
          {
            id: "org-001-001-003",
            name: "运维组",
            code: "OPS",
            parentId: "org-001-001",
            order: 3,
            status: "enabled",
          },
        ],
      },
      {
        id: "org-001-002",
        name: "产品部",
        code: "PRODUCT",
        parentId: "org-001",
        leader: "李四",
        phone: "010-23456789",
        order: 2,
        status: "enabled",
      },
      {
        id: "org-001-003",
        name: "市场部",
        code: "MARKET",
        parentId: "org-001",
        leader: "王五",
        phone: "010-34567890",
        order: 3,
        status: "enabled",
      },
      {
        id: "org-001-004",
        name: "财务部",
        code: "FINANCE",
        parentId: "org-001",
        leader: "赵六",
        phone: "010-45678901",
        order: 4,
        status: "enabled",
      },
    ],
  },
  {
    id: "org-002",
    name: "北京分公司",
    code: "BJ",
    order: 2,
    status: "enabled",
    children: [
      {
        id: "org-002-001",
        name: "销售部",
        code: "SALES_BJ",
        parentId: "org-002",
        order: 1,
        status: "enabled",
      },
      {
        id: "org-002-002",
        name: "客服部",
        code: "CS_BJ",
        parentId: "org-002",
        order: 2,
        status: "disabled",
      },
    ],
  },
];

/**
 * Mock 用户列表
 */
export const mockUsers: SystemUser[] = [
  {
    id: "user-001",
    account: "admin",
    name: "系统管理员",
    phone: "13800138000",
    email: "admin@example.com",
    status: "normal",
    sensitivityLevel: "confidential",
    orgId: "org-001",
    orgName: "集团总部",
    createdAt: "2024-01-01 00:00:00",
  },
  {
    id: "user-002",
    account: "zhangsan",
    name: "张三",
    phone: "13800138001",
    email: "zhangsan@example.com",
    status: "normal",
    sensitivityLevel: "internal",
    orgId: "org-001-001",
    orgName: "技术部",
    createdAt: "2024-01-02 10:00:00",
  },
  {
    id: "user-003",
    account: "lisi",
    name: "李四",
    phone: "13800138002",
    email: "lisi@example.com",
    status: "normal",
    sensitivityLevel: "internal",
    orgId: "org-001-002",
    orgName: "产品部",
    createdAt: "2024-01-03 11:00:00",
  },
  {
    id: "user-004",
    account: "wangwu",
    name: "王五",
    phone: "13800138003",
    email: "wangwu@example.com",
    status: "normal",
    sensitivityLevel: "secret",
    orgId: "org-001-003",
    orgName: "市场部",
    createdAt: "2024-01-04 12:00:00",
  },
  {
    id: "user-005",
    account: "zhaoliu",
    name: "赵六",
    phone: "13800138004",
    email: "zhaoliu@example.com",
    status: "disabled",
    sensitivityLevel: "public",
    orgId: "org-001-004",
    orgName: "财务部",
    createdAt: "2024-01-05 13:00:00",
  },
  {
    id: "user-006",
    account: "sunqi",
    name: "孙七",
    phone: "13800138005",
    email: "sunqi@example.com",
    status: "normal",
    sensitivityLevel: "internal",
    orgId: "org-001-001-001",
    orgName: "研发一组",
    createdAt: "2024-01-06 14:00:00",
  },
  {
    id: "user-007",
    account: "zhouba",
    name: "周八",
    phone: "13800138006",
    email: "zhouba@example.com",
    status: "normal",
    sensitivityLevel: "internal",
    orgId: "org-001-001-001",
    orgName: "研发一组",
    createdAt: "2024-01-07 15:00:00",
  },
  {
    id: "user-008",
    account: "wujiu",
    name: "吴九",
    phone: "13800138007",
    email: "wujiu@example.com",
    status: "normal",
    sensitivityLevel: "secret",
    orgId: "org-001-001-003",
    orgName: "运维组",
    createdAt: "2024-01-08 16:00:00",
  },
];

/**
 * 根据机构ID获取用户列表
 */
export function getUsersByOrgId(orgId: string): SystemUser[] {
  if (!orgId || orgId === "all") {
    return mockUsers;
  }

  // 递归获取所有子机构ID
  const getAllChildOrgIds = (orgs: Organization[], targetId: string): string[] => {
    const result: string[] = [targetId];
    const findChildren = (items: Organization[]) => {
      for (const item of items) {
        if (item.parentId === targetId) {
          result.push(item.id);
          if (item.children) {
            findChildren(item.children);
          }
        }
        if (item.children) {
          findChildren(item.children);
        }
      }
    };
    findChildren(orgs);
    return result;
  };

  const orgIds = getAllChildOrgIds(mockOrganizations, orgId);
  return mockUsers.filter((user) => orgIds.includes(user.orgId));
}

/**
 * 根据ID获取机构详情
 */
export function getOrgById(id: string): Organization | undefined {
  const findOrg = (orgs: Organization[]): Organization | undefined => {
    for (const org of orgs) {
      if (org.id === id) return org;
      if (org.children) {
        const found = findOrg(org.children);
        if (found) return found;
      }
    }
    return undefined;
  };
  return findOrg(mockOrganizations);
}