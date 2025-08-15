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
  const models = Object.keys(client).filter((key) => {
    if (key.startsWith('$') || key.startsWith('_')) return false;
    const prop = (client as any)[key];
    return prop && typeof prop === 'object' && 'deleteMany' in prop;
  });

  await Promise.allSettled(models.map((m) => (client as any)[m].deleteMany()));
};

export const disconnectDatabase = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
};
