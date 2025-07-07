import { http, HttpResponse } from 'msw';

export const handlers = [
  // Example handler (can be removed if not needed)
  http.get('https://api.example.com/user', () =>
    HttpResponse.json({
      id: 'abc-123',
      firstName: 'John',
      lastName: 'Maverick',
    }),
  ),

  // Music Practice Tracker API handlers
  http.get('http://localhost:3001/api/admin/users', () =>
    HttpResponse.json({
      data: [
        {
          id: '1',
          name: 'Test User 1',
          email: 'user1@example.com',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Test User 2',
          email: 'user2@example.com',
          createdAt: new Date().toISOString(),
        },
      ],
      total: 2,
    }),
  ),

  http.get('http://localhost:3001/api/admin/users/:id', ({ params }) =>
    HttpResponse.json({
      id: params.id as string,
      name: `Test User ${params.id as string}`,
      email: `user${params.id as string}@example.com`,
      createdAt: new Date().toISOString(),
    }),
  ),

  http.post('http://localhost:3001/api/admin/users', async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    return HttpResponse.json({
      id: 'new-user-id',
      ...body,
      createdAt: new Date().toISOString(),
    });
  }),

  http.put('http://localhost:3001/api/admin/users/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, any>;
    return HttpResponse.json({
      id: params.id as string,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  http.delete('http://localhost:3001/api/admin/users/:id', ({ params }) =>
    HttpResponse.json({
      id: params.id as string,
      deletedAt: new Date().toISOString(),
    }),
  ),
];
