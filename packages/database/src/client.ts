import prismaClientPkg from '@prisma/client';
import { getDatabaseUrl } from '@ai-datahub/shared';

const { PrismaClient } = prismaClientPkg;
type PrismaClientInstance = InstanceType<typeof PrismaClient>;
const globalForPrisma = global as unknown as { prisma: PrismaClientInstance };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
