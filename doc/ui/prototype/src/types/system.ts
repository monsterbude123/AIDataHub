/**
 * 系统管理模块类型定义
 */

/**
 * 组织机构类型
 */
export interface Organization {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  leader?: string;
  phone?: string;
  address?: string;
  order: number;
  status: "enabled" | "disabled";
  children?: Organization[];
}

/**
 * 用户信息类型
 */
export interface SystemUser {
  id: string;
  account: string;
  name: string;
  phone?: string;
  email?: string;
  status: "normal" | "disabled";
  sensitivityLevel: "public" | "internal" | "secret" | "confidential";
  orgId: string;
  orgName?: string;
  createdAt: string;
}

/**
 * 用户表单数据
 */
export interface UserFormData {
  account: string;
  name: string;
  password?: string;
  orgId: string;
  phone?: string;
  email?: string;
  sensitivityLevel: string;
  status: "normal" | "disabled";
}

/**
 * 组织机构表单数据
 */
export interface OrgFormData {
  name: string;
  parentId?: string;
  code: string;
  leader?: string;
  phone?: string;
  address?: string;
  order: number;
  status: "enabled" | "disabled";
}