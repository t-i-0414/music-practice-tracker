import type { Server } from 'http';

import { HttpStatus, NotFoundException, ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { UserAppFacadeService } from '@/modules/aggregate/user/user.app.facade.service';
import type { CreateUserInputDto, UpdateUserDataDto } from '@/modules/aggregate/user/user.input.dto';
import type { ActiveUserResponseDto } from '@/modules/aggregate/user/user.response.dto';
import { AppUsersController } from '@/modules/api/app/users/users.controller';

describe('AppUsersController', () => {
  let app: INestApplication;
  let controller: AppUsersController;
  let facadeService: jest.Mocked<UserAppFacadeService>;

  const mockActiveUser: ActiveUserResponseDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  };

  const mockActiveUserJson = {
    ...mockActiveUser,
    createdAt: mockActiveUser.createdAt.toISOString(),
    updatedAt: mockActiveUser.updatedAt.toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppUsersController],
      providers: [
        {
          provide: UserAppFacadeService,
          useValue: {
            findUserById: jest.fn(),
            createUser: jest.fn(),
            updateUserById: jest.fn(),
            deleteUserById: jest.fn(),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useLogger(false);
    await app.init();

    controller = module.get<AppUsersController>(AppUsersController);
    facadeService = module.get(UserAppFacadeService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  describe('Controller setup', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have UserAppFacadeService injected', () => {
      expect(facadeService).toBeDefined();
    });

    it('should have the correct route prefix', () => {
      const path = Reflect.getMetadata('path', AppUsersController);
      expect(path).toBe('api/app/users');
    });
  });

  describe('GET /api/app/users/:id', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';

    it('should return user by ID', async () => {
      facadeService.findUserById.mockResolvedValue(mockActiveUser);

      const response = await request(app.getHttpServer() as Server)
        .get(`/api/app/users/${validUUID}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(mockActiveUserJson);
      expect(facadeService.findUserById).toHaveBeenCalledWith({ id: validUUID });
      expect(facadeService.findUserById).toHaveBeenCalledTimes(1);
    });

    it('should validate UUID format', async () => {
      await request(app.getHttpServer() as Server)
        .get('/api/app/users/invalid-uuid')
        .expect(HttpStatus.BAD_REQUEST);

      expect(facadeService.findUserById).not.toHaveBeenCalled();
    });

    it('should handle user not found', async () => {
      facadeService.findUserById.mockRejectedValue(new NotFoundException('User not found'));

      await request(app.getHttpServer() as Server)
        .get(`/api/app/users/${validUUID}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should handle special characters in UUIDs', async () => {
      const upperCaseUUID = '123E4567-E89B-12D3-A456-426614174000';
      facadeService.findUserById.mockResolvedValue(mockActiveUser);

      await request(app.getHttpServer() as Server)
        .get(`/api/app/users/${upperCaseUUID}`)
        .expect(HttpStatus.OK);
    });
  });

  describe('POST /api/app/users', () => {
    it('should create a new user', async () => {
      const createDto: CreateUserInputDto = {
        name: 'New User',
        email: 'new@example.com',
      };

      facadeService.createUser.mockResolvedValue(mockActiveUser);

      const response = await request(app.getHttpServer() as Server)
        .post('/api/app/users')
        .send(createDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual(mockActiveUserJson);
      expect(facadeService.createUser).toHaveBeenCalledWith(createDto);
      expect(facadeService.createUser).toHaveBeenCalledTimes(1);
    });

    it('should validate request body', async () => {
      const invalidDto = {
        email: 'invalid-email',
      };

      await request(app.getHttpServer() as Server)
        .post('/api/app/users')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(facadeService.createUser).not.toHaveBeenCalled();
    });

    it('should handle duplicate email error', async () => {
      const createDto: CreateUserInputDto = {
        name: 'New User',
        email: 'existing@example.com',
      };

      facadeService.createUser.mockRejectedValue(new Error('Email already exists'));

      const response = await request(app.getHttpServer() as Server)
        .post('/api/app/users')
        .send(createDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Internal server error');
    });

    it('should handle empty body', async () => {
      await request(app.getHttpServer() as Server)
        .post('/api/app/users')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);

      expect(facadeService.createUser).not.toHaveBeenCalled();
    });

    it('should handle missing required fields', async () => {
      const incompleteDto = {
        name: 'User Without Email',
      };

      await request(app.getHttpServer() as Server)
        .post('/api/app/users')
        .send(incompleteDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(facadeService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/app/users/:id', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';

    it('should update a user', async () => {
      const updateDto: UpdateUserDataDto = {
        name: 'Updated Name',
      };

      const updatedUser = { ...mockActiveUser, name: 'Updated Name' };
      const updatedUserJson = {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      };
      facadeService.updateUserById.mockResolvedValue(updatedUser);

      const response = await request(app.getHttpServer() as Server)
        .put(`/api/app/users/${validUUID}`)
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(updatedUserJson);
      expect(facadeService.updateUserById).toHaveBeenCalledWith({
        id: validUUID,
        data: updateDto,
      });
    });

    it('should validate UUID format', async () => {
      await request(app.getHttpServer() as Server)
        .put('/api/app/users/invalid-uuid')
        .send({ name: 'Updated' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(facadeService.updateUserById).not.toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      const partialUpdate: UpdateUserDataDto = {
        email: 'newemail@example.com',
      };

      facadeService.updateUserById.mockResolvedValue(mockActiveUser);

      await request(app.getHttpServer() as Server)
        .put(`/api/app/users/${validUUID}`)
        .send(partialUpdate)
        .expect(HttpStatus.OK);

      expect(facadeService.updateUserById).toHaveBeenCalledWith({
        id: validUUID,
        data: partialUpdate,
      });
    });

    it('should handle user not found', async () => {
      facadeService.updateUserById.mockRejectedValue(new NotFoundException('User not found'));

      await request(app.getHttpServer() as Server)
        .put(`/api/app/users/${validUUID}`)
        .send({ name: 'Updated' })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should handle empty update data', async () => {
      facadeService.updateUserById.mockResolvedValue(mockActiveUser);

      await request(app.getHttpServer() as Server)
        .put(`/api/app/users/${validUUID}`)
        .send({})
        .expect(HttpStatus.OK);

      expect(facadeService.updateUserById).toHaveBeenCalledWith({
        id: validUUID,
        data: {},
      });
    });

    it('should handle all fields update', async () => {
      const fullUpdate: UpdateUserDataDto = {
        name: 'Completely Updated User',
        email: 'completely.new@example.com',
      };

      facadeService.updateUserById.mockResolvedValue(mockActiveUser);

      await request(app.getHttpServer() as Server)
        .put(`/api/app/users/${validUUID}`)
        .send(fullUpdate)
        .expect(HttpStatus.OK);

      expect(facadeService.updateUserById).toHaveBeenCalledWith({
        id: validUUID,
        data: fullUpdate,
      });
    });
  });

  describe('DELETE /api/app/users/:id', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';

    it('should soft delete a user', async () => {
      facadeService.deleteUserById.mockResolvedValue(undefined);

      await request(app.getHttpServer() as Server)
        .delete(`/api/app/users/${validUUID}`)
        .expect(HttpStatus.NO_CONTENT);

      expect(facadeService.deleteUserById).toHaveBeenCalledWith({ id: validUUID });
      expect(facadeService.deleteUserById).toHaveBeenCalledTimes(1);
    });

    it('should return no content even if user not found', async () => {
      facadeService.deleteUserById.mockResolvedValue(undefined);

      await request(app.getHttpServer() as Server)
        .delete(`/api/app/users/${validUUID}`)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should validate UUID format', async () => {
      await request(app.getHttpServer() as Server)
        .delete('/api/app/users/invalid-uuid')
        .expect(HttpStatus.BAD_REQUEST);

      expect(facadeService.deleteUserById).not.toHaveBeenCalled();
    });

    it('should handle deletion errors gracefully', async () => {
      facadeService.deleteUserById.mockRejectedValue(new Error('Database error'));

      await request(app.getHttpServer() as Server)
        .delete(`/api/app/users/${validUUID}`)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Controller method delegation', () => {
    it('should delegate all methods correctly', async () => {
      facadeService.findUserById.mockResolvedValue(mockActiveUser);
      facadeService.createUser.mockResolvedValue(mockActiveUser);
      facadeService.updateUserById.mockResolvedValue(mockActiveUser);
      facadeService.deleteUserById.mockResolvedValue(undefined);

      const id = '123e4567-e89b-12d3-a456-426614174000';
      const createDto: CreateUserInputDto = { name: 'Test', email: 'test@example.com' };
      const updateDto: UpdateUserDataDto = { name: 'Updated' };

      await controller.findUserById(id);
      expect(facadeService.findUserById).toHaveBeenCalledWith({ id });

      await controller.createUser(createDto);
      expect(facadeService.createUser).toHaveBeenCalledWith(createDto);

      await controller.updateUser(id, updateDto);
      expect(facadeService.updateUserById).toHaveBeenCalledWith({ id, data: updateDto });

      await controller.deleteUser(id);
      expect(facadeService.deleteUserById).toHaveBeenCalledWith({ id });
    });
  });

  describe('Error handling', () => {
    it('should propagate service errors without modification', async () => {
      const customError = new Error('Custom error');
      customError.stack = 'Original stack';
      facadeService.createUser.mockRejectedValue(customError);

      const response = await request(app.getHttpServer() as Server)
        .post('/api/app/users')
        .send({ name: 'Test', email: 'test@example.com' })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Internal server error');
    });

    it('should handle validation pipe errors', async () => {
      await request(app.getHttpServer() as Server)
        .get('/api/app/users/not-a-uuid')
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain('Validation failed');
        });
    });
  });

  describe('Edge cases', () => {
    it('should handle concurrent requests', async () => {
      facadeService.createUser.mockResolvedValue(mockActiveUser);

      const promises = Array.from({ length: 3 }, (_, i) =>
        request(app.getHttpServer() as Server)
          .post('/api/app/users')
          .send({ name: `User ${i}`, email: `user${i}@example.com` }),
      );

      const results = await Promise.all(promises);
      results.forEach((result) => {
        expect(result.status).toBe(HttpStatus.CREATED);
      });

      expect(facadeService.createUser).toHaveBeenCalledTimes(3);
    });

    it('should handle very long input values', async () => {
      const longName = 'a'.repeat(1000);
      const createDto: CreateUserInputDto = {
        name: longName,
        email: 'long@example.com',
      };

      await request(app.getHttpServer() as Server)
        .post('/api/app/users')
        .send(createDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(facadeService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('Response structure', () => {
    it('should return proper JSON response for user', async () => {
      facadeService.findUserById.mockResolvedValue(mockActiveUser);

      const response = await request(app.getHttpServer() as Server)
        .get(`/api/app/users/${mockActiveUser.id}`)
        .expect('Content-Type', /json/u)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body).not.toHaveProperty('deletedAt');
    });

    it('should return empty body for NO_CONTENT responses', async () => {
      facadeService.deleteUserById.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer() as Server)
        .delete(`/api/app/users/${mockActiveUser.id}`)
        .expect(HttpStatus.NO_CONTENT);

      expect(response.body).toEqual({});
    });
  });

  describe('Security considerations', () => {
    it('should not expose internal error details', async () => {
      const sensitiveError = new Error('Database connection failed at 192.168.1.1');
      facadeService.findUserById.mockRejectedValue(sensitiveError);

      const response = await request(app.getHttpServer() as Server)
        .get(`/api/app/users/${mockActiveUser.id}`)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(response.body.message).toBe('Internal server error');
      expect(response.body.message).not.toContain('192.168.1.1');
    });

    it('should handle malformed JSON gracefully', async () => {
      await request(app.getHttpServer() as Server)
        .post('/api/app/users')
        .set('Content-Type', 'application/json')
        .send('{"invalid json')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});