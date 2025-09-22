import { config as loadEnv } from 'dotenv';
import admin from 'firebase-admin';

loadEnv({ path: '.env' });

type SeedUserDefinition = {
  claims?: Record<string, unknown>;
} & admin.auth.CreateRequest;

const USERS: SeedUserDefinition[] = [
  {
    uid: 'user-1',
    email: 'user-1@example.com',
    emailVerified: true,
    password: 'password',
    displayName: 'User1',
    disabled: false,
  },
  {
    uid: 'user-2',
    email: 'user-2@example.com',
    emailVerified: true,
    password: 'password',
    displayName: 'User2',
    disabled: false,
  },
];

type UpsertResult = {
  action: 'created' | 'updated';
  uid: string;
};

async function upsertUser(definition: SeedUserDefinition): Promise<UpsertResult> {
  const { uid, email, claims, ...rest } = definition;

  if (uid === undefined) {
    throw new Error('uid is required in user definition');
  }

  let existing: admin.auth.UserRecord | null = null;
  try {
    existing = await admin.auth().getUser(uid);
  } catch {
    if (email !== undefined) {
      try {
        existing = await admin.auth().getUserByEmail(email);
      } catch {
        existing = null;
      }
    }
  }

  if (existing !== null) {
    const update: admin.auth.UpdateRequest = { ...rest };

    if (email !== undefined && email !== existing.email) {
      update.email = email;
    }

    if (typeof definition.disabled === 'boolean') {
      update.disabled = definition.disabled;
    }

    if (typeof definition.displayName === 'string') {
      update.displayName = definition.displayName;
    }

    if (typeof definition.password === 'string' && definition.password.length > 0) {
      update.password = definition.password;
    }

    if (typeof definition.emailVerified === 'boolean') {
      update.emailVerified = definition.emailVerified;
    }

    if (Object.keys(update).length > 0) {
      await admin.auth().updateUser(existing.uid, update);
    }

    if (claims && Object.keys(claims).length > 0) {
      await admin.auth().setCustomUserClaims(existing.uid, claims);
    }

    return { action: 'updated', uid: existing.uid };
  }

  const createRequest: admin.auth.CreateRequest = {
    uid,
    email,
    ...rest,
  };

  const created = await admin.auth().createUser(createRequest);

  if (claims && Object.keys(claims).length > 0) {
    await admin.auth().setCustomUserClaims(created.uid, claims);
  }

  return { action: 'created', uid: created.uid };
}

async function main(): Promise<void> {
  console.log('[seed-auth] projectId:', process.env.PROJECT_ID);
  console.log('[seed-auth] emulatorHost:', process.env.FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9099');

  admin.initializeApp({ projectId: process.env.PROJECT_ID });

  await Promise.all(
    USERS.map(async (userDefinition) => {
      const result = await upsertUser(userDefinition);
      console.log(`[seed-auth] ${result.action}: ${result.uid}`);
    }),
  );

  console.log('[seed-auth] done');
}

void main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error('[seed-auth] error:', error);
    process.exit(1);
  });
