import { setupAdminUsersControllerIntegration } from '../helpers/api-integration.helper';

import { AdminApiUsersController } from '@/apis/admin/users/users.controller';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('integration AdminApiUsersController', () => {
  let controller: AdminApiUsersController;
  let databaseHelper: DatabaseHelper;

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();

    const { controller: ctrl } = await setupAdminUsersControllerIntegration(databaseHelper);
    controller = ctrl;
  });

  afterAll(async () => {
    await databaseHelper.disconnect();
  });

  describe('post /admin/users', () => {
    it('should create a user and return response', async () => {
      expect.assertions(3);

      const createDto = {
        name: 'Test User',
        firebaseUid: 'uid-admin-create',
      };

      const result = await controller.createUser(createDto);

      expect(result.name).toBe(createDto.name);
      expect(result.firebaseUid).toBe(createDto.firebaseUid);
      expect(result.publicId).toBeDefined();
    });
  });

  describe('post /admin/users/bulk', () => {
    it('should create multiple users', async () => {
      expect.assertions(3);

      const createDto = {
        users: [
          { name: 'User 1', firebaseUid: 'uid-admin-bulk-1' },
          { name: 'User 2', firebaseUid: 'uid-admin-bulk-2' },
        ],
      };

      const result = await controller.createManyAndReturnUsers(createDto);

      expect(result.users).toHaveLength(2);
      expect(result.users.map((user) => user.name)).toStrictEqual(['User 1', 'User 2']);
      expect(result.users.map((user) => user.firebaseUid)).toStrictEqual(['uid-admin-bulk-1', 'uid-admin-bulk-2']);
    });
  });

  describe('get /admin/users', () => {
    it('should return users by publicIds', async () => {
      expect.assertions(2);

      const user1 = await controller.createUser({
        name: 'User 1',
        firebaseUid: 'uid-admin-list-1',
      });

      await controller.createUser({
        name: 'User 2',
        firebaseUid: 'uid-admin-list-2',
      });

      const user3 = await controller.createUser({
        name: 'User 3',
        firebaseUid: 'uid-admin-list-3',
      });

      const result = await controller.findManyUsersById([user1.publicId, user3.publicId]);

      expect(result.users).toHaveLength(2);
      expect(result.users.map((u) => u.publicId).sort()).toStrictEqual([user1.publicId, user3.publicId].sort());
    });

    it('should return empty array when publicIds is empty', async () => {
      expect.assertions(1);

      await controller.createUser({
        name: 'User',
        firebaseUid: 'uid-admin-empty',
      });

      const result = await controller.findManyUsersById([]);

      expect(result.users).toHaveLength(0);
    });
  });

  describe('get /admin/users/:publicId', () => {
    it('should return a specific user by publicId', async () => {
      expect.assertions(3);

      const created = await controller.createUser({
        name: 'Test User',
        firebaseUid: 'uid-admin-get',
      });

      const result = await controller.findUniqueOrThrowUserById(created.publicId);

      expect(result.publicId).toBe(created.publicId);
      expect(result.name).toBe('Test User');
      expect(result.firebaseUid).toBe('uid-admin-get');
    });
  });

  describe('put /admin/users/:publicId', () => {
    it('should update a user', async () => {
      expect.assertions(3);

      const created = await controller.createUser({
        name: 'Original Name',
        firebaseUid: 'uid-admin-update',
      });

      const updateData = {
        name: 'Updated Name',
      };

      const result = await controller.updateUserById(created.publicId, updateData);

      expect(result.publicId).toBe(created.publicId);
      expect(result.name).toBe('Updated Name');
      expect(result.firebaseUid).toBe('uid-admin-update');
    });
  });

  describe('delete /admin/users/:publicId', () => {
    it('should delete a user', async () => {
      expect.assertions(1);

      const created = await controller.createUser({ name: 'To Delete', firebaseUid: 'uid-admin-delete' });

      await controller.deleteUserById(created.publicId);

      await expect(controller.findUniqueOrThrowUserById(created.publicId)).rejects.toThrow('No record was found');
    });
  });

  describe('delete /admin/users', () => {
    it('should delete multiple users', async () => {
      expect.assertions(1);

      const user1 = await controller.createUser({ name: 'User 1', firebaseUid: 'uid-admin-del-1' });

      const user2 = await controller.createUser({ name: 'User 2', firebaseUid: 'uid-admin-del-2' });

      const user3 = await controller.createUser({ name: 'User 3', firebaseUid: 'uid-admin-del-3' });

      await controller.deleteManyUsersById({ publicIds: [user1.publicId, user2.publicId] });

      const allUsers = await Promise.all([controller.findUniqueOrThrowUserById(user3.publicId).catch(() => null)]);

      expect(allUsers.filter((u: any) => u !== null)).toHaveLength(1);
    });
  });
});
