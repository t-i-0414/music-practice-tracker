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
