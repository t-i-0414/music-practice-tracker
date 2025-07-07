import { http, HttpResponse } from 'msw';

import type { components } from '../../generated/types/api';

export const handlers = [
  // Admin Users - Active Users
  http.get('http://localhost:3001/api/users/active_users', ({ request }) => {
    const url = new URL(request.url);
    const ids = url.searchParams.getAll('ids');

    const response: components['schemas']['ActiveUsersResponseDto'] = {
      users: ids.map((id, index) => ({
        id,
        email: `user${index + 1}@example.com`,
        name: `Test User ${index + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };

    return HttpResponse.json(response);
  }),

  http.get('http://localhost:3001/api/users/active_users/:id', ({ params }) => {
    const response: components['schemas']['ActiveUserResponseDto'] = {
      id: params.id as string,
      email: `user${params.id}@example.com`,
      name: `Test User ${params.id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(response);
  }),

  // Admin Users - Deleted Users
  http.get('http://localhost:3001/api/users/deleted_users', ({ request }) => {
    const url = new URL(request.url);
    const ids = url.searchParams.getAll('ids');

    const response: components['schemas']['DeletedUsersResponseDto'] = {
      users: ids.map((id, index) => ({
        id,
        email: `deleted${index + 1}@example.com`,
        name: `Deleted User ${index + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: new Date().toISOString(),
      })),
    };

    return HttpResponse.json(response);
  }),

  http.get('http://localhost:3001/api/users/deleted_users/:id', ({ params }) => {
    const response: components['schemas']['DeletedUserResponseDto'] = {
      id: params.id as string,
      email: `deleted${params.id}@example.com`,
      name: `Deleted User ${params.id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: new Date().toISOString(),
    };

    return HttpResponse.json(response);
  }),

  // Admin Users - Any Users (active or deleted)
  http.get('http://localhost:3001/api/users/any_users', ({ request }) => {
    const url = new URL(request.url);
    const ids = url.searchParams.getAll('ids');

    const response: components['schemas']['AnyUsersResponseDto'] = {
      users: ids.map((id, index) => ({
        id,
        email: `any${index + 1}@example.com`,
        name: `Any User ${index + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: index % 2 === 0 ? null : new Date().toISOString(),
      })),
    };

    return HttpResponse.json(response);
  }),

  http.get('http://localhost:3001/api/users/any_users/:id', ({ params }) => {
    const isDeleted = parseInt(params.id as string, 10) % 2 === 1;
    const response: components['schemas']['AnyUserResponseDto'] = {
      id: params.id as string,
      email: `any${params.id}@example.com`,
      name: `Any User ${params.id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: isDeleted ? new Date().toISOString() : null,
    };

    return HttpResponse.json(response);
  }),

  // Create operations
  http.post('http://localhost:3001/api/users', async ({ request }) => {
    const body = (await request.json()) as components['schemas']['CreateUserInputDto'];
    const response: components['schemas']['ActiveUserResponseDto'] = {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  http.post('http://localhost:3001/api/users/bulk', async ({ request }) => {
    const body = (await request.json()) as components['schemas']['CreateManyUsersInputDto'];
    const response: components['schemas']['ActiveUsersResponseDto'] = {
      users: body.users.map((user) => ({
        id: crypto.randomUUID(),
        ...user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  // Update operations
  http.put('http://localhost:3001/api/users/:id', async ({ params, request }) => {
    const body = (await request.json()) as components['schemas']['UpdateUserDataDto'];
    const response: components['schemas']['ActiveUserResponseDto'] = {
      id: params.id as string,
      email: body.email ?? `updated${params.id}@example.com`,
      name: body.name ?? `Updated User ${params.id}`,
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(response);
  }),

  // Delete operations (soft delete)
  http.delete('http://localhost:3001/api/users/:id', () => new HttpResponse(null, { status: 204 })),

  http.delete('http://localhost:3001/api/users/bulk', () => {
    try {
      return new HttpResponse(null, { status: 204 });
    } catch (_error) {
      return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
  }),

  // Hard delete operations
  http.delete('http://localhost:3001/api/users/hard/:id', () => new HttpResponse(null, { status: 204 })),

  http.delete('http://localhost:3001/api/users/hard/bulk', () => new HttpResponse(null, { status: 204 })),

  // Restore operations
  http.put('http://localhost:3001/api/users/:id/restore', ({ params }) => {
    const response: components['schemas']['ActiveUserResponseDto'] = {
      id: params.id as string,
      email: `restored${params.id}@example.com`,
      name: `Restored User ${params.id}`,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(response);
  }),

  http.put('http://localhost:3001/api/users/restore/bulk', async ({ request }) => {
    const body = (await request.json()) as components['schemas']['RestoreManyUsersInputDto'];
    const response: components['schemas']['ActiveUsersResponseDto'] = {
      users: body.ids.map((id) => ({
        id,
        email: `restored${id}@example.com`,
        name: `Restored User ${id}`,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };

    return HttpResponse.json(response);
  }),
];
