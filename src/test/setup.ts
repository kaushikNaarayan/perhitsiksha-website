import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock Counter API responses
const handlers = [
  // Mock Counter API increment endpoint
  http.get(
    'https://api.counterapi.dev/v2/perhitsiksha/perhitsiksha-visits/up',
    () => {
      return HttpResponse.json({
        code: 'OK',
        data: {
          id: 593,
          name: 'Perhitsiksha-visits',
          slug: 'perhitsiksha-visits',
          up_count: 25,
          down_count: 0,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          workspace_id: 1,
          workspace_slug: 'perhitsiksha',
          team_id: 1,
          user_id: 1,
          description: 'Website visitor counter',
        },
      });
    }
  ),

  // Mock Counter API get endpoint
  http.get(
    'https://api.counterapi.dev/v2/perhitsiksha/perhitsiksha-visits',
    () => {
      return HttpResponse.json({
        code: 'OK',
        data: {
          id: 593,
          name: 'Perhitsiksha-visits',
          slug: 'perhitsiksha-visits',
          up_count: 25,
          down_count: 0,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          workspace_id: 1,
          workspace_slug: 'perhitsiksha',
          team_id: 1,
          user_id: 1,
          description: 'Website visitor counter',
        },
      });
    }
  ),
];

const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());

// Make server available globally for individual test customization
declare global {
  var __msw_server__: typeof server;
}

globalThis.__msw_server__ = server;
