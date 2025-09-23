import type { INestApplication } from '@nestjs/common';

import { AppApiModule } from '@/apis/app/app.module';
import { createUserViaApi } from '@/tests/helpers/create-user-via-api';
import { DatabaseHelper } from '@/tests/helpers/database.helper';
import { FirebaseAuthEmulatorHelper } from '@/tests/helpers/firebase-auth-emulator.helper';
import { createTestingApp, type TestingHttpClient } from '@/tests/helpers/testing-app.helper';

describe('e2e AppApiUsersController', () => {
  let app: INestApplication;
  let httpClient: TestingHttpClient;
  let databaseHelper: DatabaseHelper;
  let firebaseHelper: FirebaseAuthEmulatorHelper;

  beforeAll(async () => {
    firebaseHelper = new FirebaseAuthEmulatorHelper();
    await firebaseHelper.ensureHealthy();

    ({ app, httpClient } = await createTestingApp(AppApiModule));

    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
  });

  beforeEach(async () => {
    await firebaseHelper.resetAllUsers();
    await databaseHelper.cleanDatabase();
  });

  afterAll(async () => {
    await firebaseHelper.resetAllUsers();
    await databaseHelper.disconnect();
    await app.close();
  });

  it('creates a user when a verified token is provided', async () => {
    expect.assertions(2);

    const { idToken, uid } = await firebaseHelper.createVerifiedUser();

    const response = await httpClient
      .post('/api/users')
      .set('Authorization', `Bearer ${idToken}`)
      .send({ firebaseUid: uid, name: 'Alice Example' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      publicId: expect.any(String),
      firebaseUid: uid,
      name: 'Alice Example',
      status: 'ACTIVE',
    });
  });

  it('returns the current user profile', async () => {
    expect.assertions(2);

    const { idToken, uid } = await firebaseHelper.createVerifiedUser();
    const publicId = await createUserViaApi({
      httpClient,
      token: idToken,
      firebaseUid: uid,
      name: 'Alice Example',
    });

    const response = await httpClient.get('/api/users/me').set('Authorization', `Bearer ${idToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      publicId,
      firebaseUid: uid,
      name: 'Alice Example',
      status: 'ACTIVE',
    });
  });

  it('updates the current user profile', async () => {
    expect.assertions(2);

    const { idToken, uid } = await firebaseHelper.createVerifiedUser();
    const publicId = await createUserViaApi({
      httpClient,
      token: idToken,
      firebaseUid: uid,
      name: 'Alice Example',
    });

    const response = await httpClient
      .put('/api/users/me')
      .set('Authorization', `Bearer ${idToken}`)
      .send({ name: 'Updated Alice' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      publicId,
      firebaseUid: uid,
      name: 'Updated Alice',
    });
  });

  it('deletes the current user and removes the record from the database and firebase', async () => {
    expect.assertions(3);

    const { idToken, uid } = await firebaseHelper.createVerifiedUser();
    const publicId = await createUserViaApi({
      httpClient,
      token: idToken,
      firebaseUid: uid,
      name: 'Alice Example',
    });

    const response = await httpClient.delete('/api/users/me').set('Authorization', `Bearer ${idToken}`);
    const userInDatabase = await databaseHelper.client.user.findUnique({ where: { publicId } });
    const userInFirebase = await firebaseHelper.getUserByIdToken(idToken);

    expect(response.status).toBe(204);
    expect(userInDatabase).toBeNull();
    expect(userInFirebase).toBeNull();
  });
});
