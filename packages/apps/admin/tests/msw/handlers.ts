import { http, HttpResponse } from 'msw';

import type { components } from '../../generated/types/api';

const host = process.env.HOST ?? 'localhost';
const adminApiPort = process.env.ADMIN_API_PORT ?? '3001';

export const handlers = [
  // Fetch operations
  http.get(`http://${host}:${adminApiPort}/api/users`, ({ request }) => {
    const url = new URL(request.url);
    const publicIds = url.searchParams.getAll('publicIds');

    const response: components['schemas']['UsersResponseDto'] = {
      users: publicIds.map((publicId, index) => ({
        publicId,
        email: `user${index + 1}@example.com`,
        name: `Test User ${index + 1}`,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };

    return HttpResponse.json(response);
  }),

  http.get(`http://${host}:${adminApiPort}/api/users/:publicId`, ({ params }) => {
    const response: components['schemas']['UserResponseDto'] = {
      publicId: params.publicId as string,
      email: `user${params.publicId}@example.com`,
      name: `Test User ${params.publicId}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(response);
  }),

  // Create operations
  http.post(`http://${host}:${adminApiPort}/api/users`, async ({ request }) => {
    const body = (await request.json()) as components['schemas']['CreateUserInputDto'];
    const response: components['schemas']['UserResponseDto'] = {
      publicId: crypto.randomUUID(),
      ...body,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  http.post(`http://${host}:${adminApiPort}/api/users/bulk`, async ({ request }) => {
    const body = (await request.json()) as components['schemas']['CreateManyUsersInputDto'];
    const response: components['schemas']['UsersResponseDto'] = {
      users: body.users.map((user) => ({
        publicId: crypto.randomUUID(),
        ...user,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  // Update operations
  http.put(`http://${host}:${adminApiPort}/api/users/:publicId`, async ({ params, request }) => {
    const body = (await request.json()) as components['schemas']['UpdateUserDataDto'];
    const response: components['schemas']['UserResponseDto'] = {
      publicId: params.publicId as string,
      email: body.email ?? `updated${params.publicId}@example.com`,
      name: body.name ?? `Updated User ${params.publicId}`,
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(response);
  }),

  // Delete operations
  http.delete(`http://${host}:${adminApiPort}/api/users/:publicId`, () => new HttpResponse(null, { status: 204 })),

  http.delete(`http://${host}:${adminApiPort}/api/users/bulk`, () => {
    try {
      return new HttpResponse(null, { status: 204 });
    } catch (_error) {
      return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
  }),
];
