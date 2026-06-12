import { vi } from 'vitest';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { TestRailClient } from '../../../src/client/api/index.js';
import { TestRailClientConfig } from '../../../src/client/api/baseClient.js';

// Mock axios
vi.mock('axios');

// Function to set up standard mocks
export function setupMocks() {
  // Mock axios instance
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
    defaults: {
      headers: {
        common: {}
      },
      timeout: 30000
    },
    interceptors: {
      request: {
        use: vi.fn(),
        eject: vi.fn(),
        clear: vi.fn()
      },
      response: {
        use: vi.fn((fn) => fn),
        eject: vi.fn(),
        clear: vi.fn()
      }
    }
  } as unknown as AxiosInstance;
  
  // Setup axios mocks
  vi.mocked(axios.create).mockReturnValue(mockAxiosInstance);
  
  return mockAxiosInstance;
}

// Create a client for testing
export function createTestClient() {
  const mockConfig: TestRailClientConfig = {
    baseURL: 'https://example.testrail.com',
    auth: {
      username: 'test@example.com',
      password: 'api_key'
    }
  };
  
  return new TestRailClient(mockConfig);
} 