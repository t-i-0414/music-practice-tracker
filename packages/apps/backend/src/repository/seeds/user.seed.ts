import { config as loadEnv } from 'dotenv';

import { UserStatusRecord, type UserStatusType } from '@/domain/aggregates/user/utils/constants';
import { PrismaClient } from '@/generated/prisma';

loadEnv({ path: '.env' });

const prismaClient = new PrismaClient();

type SeedUserDefinition = {
  firebaseUid: string;
  name: string;
  status?: UserStatusType;
};

const USERS: SeedUserDefinition[] = [
  {
    firebaseUid: 'user-1',
    name: 'User One',
    status: UserStatusRecord.ACTIVE,
  },
  {
    firebaseUid: 'user-2',
    name: 'User Two',
    status: UserStatusRecord.ACTIVE,
  },
];

type UpsertResult = {
  action: 'created' | 'updated';
  publicId: string;
  firebaseUid: string;
};

async function findUniqueUser(
  firebaseUid: string,
): Promise<{ publicId: string; firebaseUid: string; name: string; status: string } | null> {
  return prismaClient.user.findUnique({
    where: { firebaseUid },
  });
}

async function updateUser(
  firebaseUid: string,
  data: { name: string; status: UserStatusType },
): Promise<{ publicId: string; firebaseUid: string }> {
  return prismaClient.user.update({
    where: { firebaseUid },
    data,
  });
}

async function createUser(data: {
  firebaseUid: string;
  name: string;
  status: UserStatusType;
}): Promise<{ publicId: string; firebaseUid: string }> {
  return prismaClient.user.create({
    data,
  });
}

async function upsertUser(definition: SeedUserDefinition): Promise<UpsertResult> {
  const { firebaseUid, name, status = UserStatusRecord.ACTIVE } = definition;

  const existing = await findUniqueUser(firebaseUid);

  if (existing) {
    const updated = await updateUser(firebaseUid, { name, status });

    return {
      action: 'updated',
      publicId: updated.publicId,
      firebaseUid: updated.firebaseUid,
    };
  }

  const created = await createUser({ firebaseUid, name, status });

  return {
    action: 'created',
    publicId: created.publicId,
    firebaseUid: created.firebaseUid,
  };
}

async function main(): Promise<void> {
  console.log('[seed-user] Starting user seed...');
  console.log('[seed-user] Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/u, ':****@'));

  try {
    await prismaClient.$connect();
    console.log('[seed-user] Connected to database');

    const results = await Promise.all(
      USERS.map(async (userDefinition) => {
        try {
          const result = await upsertUser(userDefinition);
          console.log(`[seed-user] ${result.action}: ${result.firebaseUid} (publicId: ${result.publicId})`);
          return result;
        } catch (error) {
          console.error(`[seed-user] Failed to upsert user ${userDefinition.firebaseUid}:`, error);
          throw error;
        }
      }),
    );

    console.log(`[seed-user] Successfully processed ${results.length} users`);
  } catch (error) {
    console.error('[seed-user] Error during seeding:', error);
    throw error;
  } finally {
    await prismaClient.$disconnect();
    console.log('[seed-user] Disconnected from database');
  }

  console.log('[seed-user] Done');
}

void main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error('[seed-user] Fatal error:', error);
    process.exit(1);
  });
