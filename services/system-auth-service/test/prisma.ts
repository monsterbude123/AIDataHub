import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

// Use a file-based test database in the test directory
const TEST_DB_DIR = path.join(__dirname, 'data');
const TEST_DB_PATH = path.join(TEST_DB_DIR, 'test.db');
const DATABASE_URL = `file:${TEST_DB_PATH}`;

let prismaInstance: PrismaClient | null = null;
let tablesCreated = false;

// Ensure test data directory exists
function ensureTestDir() {
  if (!fs.existsSync(TEST_DB_DIR)) {
    fs.mkdirSync(TEST_DB_DIR, { recursive: true });
  }
}

export function getTestPrisma(): PrismaClient {
  if (!prismaInstance) {
    ensureTestDir();
    prismaInstance = new PrismaClient({
      datasources: { db: { url: DATABASE_URL } },
      log: ['error'],
    });
  }
  return prismaInstance;
}

async function createTables(client: PrismaClient) {
  if (tablesCreated) return;

  // Create tables exactly matching Prisma schema
  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      parentId TEXT,
      sort INTEGER,
      status TEXT DEFAULT 'ENABLED',
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      passwordHash TEXT,
      email TEXT,
      realName TEXT,
      phone TEXT,
      level INTEGER,
      status TEXT DEFAULT 'ENABLED',
      orgId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      enabled INTEGER NOT NULL DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      resource TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      roleId TEXT NOT NULL,
      UNIQUE(userId, roleId)
    )
  `);

  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      id TEXT PRIMARY KEY,
      roleId TEXT NOT NULL,
      permissionId TEXT NOT NULL,
      UNIQUE(roleId, permissionId)
    )
  `);

  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS menu_nodes (
      id TEXT PRIMARY KEY,
      parentId TEXT,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      path TEXT,
      icon TEXT,
      permissionCode TEXT,
      enabled INTEGER NOT NULL DEFAULT 1,
      sort INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS directory_nodes (
      id TEXT PRIMARY KEY,
      parentId TEXT,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      attributes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS approval_templates (
      id TEXT PRIMARY KEY,
      businessType TEXT NOT NULL,
      name TEXT NOT NULL,
      definition TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      businessType TEXT NOT NULL,
      businessId TEXT NOT NULL,
      title TEXT NOT NULL,
      applicantId TEXT NOT NULL,
      currentNode INTEGER,
      payload TEXT,
      templateId TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      history TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS data_permissions (
      id TEXT PRIMARY KEY,
      roleId TEXT NOT NULL,
      scope TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes
  await client.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_users_orgId ON users(orgId)`
  );
  await client.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_user_roles_userId ON user_roles(userId)`
  );
  await client.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_user_roles_roleId ON user_roles(roleId)`
  );
  await client.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_role_permissions_roleId ON role_permissions(roleId)`
  );
  await client.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_role_permissions_permissionId ON role_permissions(permissionId)`
  );
  await client.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_menu_nodes_parentId ON menu_nodes(parentId)`
  );
  await client.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_directory_nodes_parentId ON directory_nodes(parentId)`
  );
  await client.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_approvals_applicantId ON approvals(applicantId)`
  );
  await client.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_approvals_templateId ON approvals(templateId)`
  );
  await client.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status)`
  );
  await client.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_approval_templates_businessType ON approval_templates(businessType)`
  );
  await client.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_data_permissions_roleId ON data_permissions(roleId)`
  );

  tablesCreated = true;
}

export async function setupTestDatabase() {
  const client = getTestPrisma();
  await createTables(client);
  return client;
}

export async function resetTestDatabase() {
  // Instead of deleting rows, recreate the entire database
  // This avoids SQLite lock contention issues

  // Disconnect existing client
  if (prismaInstance) {
    try {
      await prismaInstance.$disconnect();
    } catch {
      // Ignore disconnect errors during reset
    }
    prismaInstance = null;
    tablesCreated = false;
  }

  // Delete and recreate database file
  if (fs.existsSync(TEST_DB_PATH)) {
    try {
      fs.unlinkSync(TEST_DB_PATH);
    } catch {
      // If file is locked, wait a bit and retry
      await new Promise((resolve) => setTimeout(resolve, 100));
      try {
        fs.unlinkSync(TEST_DB_PATH);
      } catch {
        // Ignore second unlink attempt failure
      }
    }
  }
  const journalPath = TEST_DB_PATH + '-journal';
  if (fs.existsSync(journalPath)) {
    try {
      fs.unlinkSync(journalPath);
    } catch {
      // Ignore journal file deletion errors
    }
  }

  // Create new database file
  fs.writeFileSync(TEST_DB_PATH, '');

  // Get new client and create tables
  const client = getTestPrisma();
  await createTables(client);
}

export async function teardownTestDatabase() {
  if (prismaInstance) {
    try {
      await prismaInstance.$disconnect();
    } catch {
      // Ignore disconnect errors during teardown
    }
    prismaInstance = null;
    tablesCreated = false;
  }
}

export const prisma = getTestPrisma();
