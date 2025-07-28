import { http, HttpResponse } from 'msw';

import type { components } from '../../generated/types/api';

const host = process.env.HOST ?? 'localhost';
const adminApiPort = process.env.ADMIN_API_PORT ?? '3001';

export const handlers = [
  // Admin Users - Active Users
  http.get(`http://${host}:${adminApiPort}/api/users/active_users`, ({ request }) => {
    const url = new URL(request.url);
    const publicIds = url.searchParams.getAll('publicIds');

    const response: components['schemas']['ActiveUsersResponseDto'] = {
      users: publicIds.map((publicId, index) => ({
        publicId,
        email: `user${index + 1}@example.com`,
        name: `Test User ${index + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };

    return HttpResponse.json(response);
  }),

  http.get(`http://${host}:${adminApiPort}/api/users/active_users/:publicId`, ({ params }) => {
    const response: components['schemas']['ActiveUserResponseDto'] = {
      publicId: params.publicId as string,
      email: `user${params.publicId}@example.com`,
      name: `Test User ${params.publicId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(response);
  }),

  // Admin Users - Deleted Users
  http.get(`http://${host}:${adminApiPort}/api/users/deleted_users`, ({ request }) => {
    const url = new URL(request.url);
    const publicIds = url.searchParams.getAll('publicIds');

    const response: components['schemas']['DeletedUsersResponseDto'] = {
      users: publicIds.map((publicId, index) => ({
        publicId,
        email: `deleted${index + 1}@example.com`,
        name: `Deleted User ${index + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: new Date().toISOString(),
      })),
    };

    return HttpResponse.json(response);
  }),

  http.get(`http://${host}:${adminApiPort}/api/users/deleted_users/:publicId`, ({ params }) => {
    const response: components['schemas']['DeletedUserResponseDto'] = {
      publicId: params.publicId as string,
      email: `deleted${params.publicId}@example.com`,
      name: `Deleted User ${params.publicId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: new Date().toISOString(),
    };

    return HttpResponse.json(response);
  }),

  // Admin Users - Any Users (active or deleted)
  http.get(`http://${host}:${adminApiPort}/api/users/any_users`, ({ request }) => {
    const url = new URL(request.url);
    const publicIds = url.searchParams.getAll('publicIds');

    const response: components['schemas']['AnyUsersResponseDto'] = {
      users: publicIds.map((publicId, index) => ({
        publicId,
        email: `any${index + 1}@example.com`,
        name: `Any User ${index + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: index % 2 === 0 ? null : new Date().toISOString(),
      })),
    };

    return HttpResponse.json(response);
  }),

  http.get(`http://${host}:${adminApiPort}/api/users/any_users/:publicId`, ({ params }) => {
    const isDeleted = parseInt(params.publicId as string, 10) % 2 === 1;
    const response: components['schemas']['AnyUserResponseDto'] = {
      publicId: params.publicId as string,
      email: `any${params.publicId}@example.com`,
      name: `Any User ${params.publicId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: isDeleted ? new Date().toISOString() : null,
    };

    return HttpResponse.json(response);
  }),

  // Create operations
  http.post(`http://${host}:${adminApiPort}/api/users`, async ({ request }) => {
    const body = (await request.json()) as components['schemas']['CreateUserInputDto'];
    const response: components['schemas']['ActiveUserResponseDto'] = {
      publicId: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  http.post(`http://${host}:${adminApiPort}/api/users/bulk`, async ({ request }) => {
    const body = (await request.json()) as components['schemas']['CreateManyUsersInputDto'];
    const response: components['schemas']['ActiveUsersResponseDto'] = {
      users: body.users.map((user) => ({
        publicId: crypto.randomUUID(),
        ...user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  // Update operations
  http.put(`http://${host}:${adminApiPort}/api/users/:publicId`, async ({ params, request }) => {
    const body = (await request.json()) as components['schemas']['UpdateUserDataDto'];
    const response: components['schemas']['ActiveUserResponseDto'] = {
      publicId: params.publicId as string,
      email: body.email ?? `updated${params.publicId}@example.com`,
      name: body.name ?? `Updated User ${params.publicId}`,
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(response);
  }),

  // Delete operations (soft delete)
  http.delete(`http://${host}:${adminApiPort}/api/users/:publicId`, () => new HttpResponse(null, { status: 204 })),

  http.delete(`http://${host}:${adminApiPort}/api/users/bulk`, () => {
    try {
      return new HttpResponse(null, { status: 204 });
    } catch (_error) {
      return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
  }),

  // Hard delete operations
  http.delete(`http://${host}:${adminApiPort}/api/users/hard/:publicId`, () => new HttpResponse(null, { status: 204 })),

  http.delete(`http://${host}:${adminApiPort}/api/users/hard/bulk`, () => new HttpResponse(null, { status: 204 })),

  // Restore operations
  http.put(`http://${host}:${adminApiPort}/api/users/:publicId/restore`, ({ params }) => {
    const response: components['schemas']['ActiveUserResponseDto'] = {
      publicId: params.publicId as string,
      email: `restored${params.publicId}@example.com`,
      name: `Restored User ${params.publicId}`,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(response);
  }),

  http.put(`http://${host}:${adminApiPort}/api/users/restore/bulk`, async ({ request }) => {
    const body = (await request.json()) as components['schemas']['RestoreManyUsersInputDto'];
    const response: components['schemas']['ActiveUsersResponseDto'] = {
      users: body.publicIds.map((publicId) => ({
        publicId,
        email: `restored${publicId}@example.com`,
        name: `Restored User ${publicId}`,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };

    return HttpResponse.json(response);
  }),
];
