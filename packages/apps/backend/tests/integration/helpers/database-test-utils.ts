import { PrismaClient } from '@/generated/prisma';

let prisma: PrismaClient | null = null;

export const getPrismaClient = (): PrismaClient => {
  prisma ??= new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  return prisma;
};

export const cleanupDatabase = async (): Promise<void> => {
  const client = getPrismaClient();

  await client.user.deleteMany({});
};

export const disconnectDatabase = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
};

export const seedTestData = async (): Promise<void> => {
  const client = getPrismaClient();

  await client.user.createMany({
    data: [
      {
        name: 'Test User 1',
        email: 'test1@example.com',
      },
      {
        name: 'Test User 2',
        email: 'test2@example.com',
      },
    ],
  });
};

export const withTransaction = async <T>(callback: (tx: PrismaClient) => Promise<T>): Promise<T> => {
  const client = getPrismaClient();
  return client.$transaction(async (tx) => callback(tx as PrismaClient));
};
