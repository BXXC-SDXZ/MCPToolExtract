import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupMocks, createTestClient } from './testHelper';

describe('Shared Steps API', () => {
  let mockAxiosInstance: ReturnType<typeof setupMocks>;
  let client: ReturnType<typeof createTestClient>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosInstance = setupMocks();
    client = createTestClient();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('retrieves all shared steps for a project', async () => {
    // Mock response
    const mockSharedSteps = [
      {
        id: 1,
        title: 'Login Process',
        project_id: 1,
        created_by: 1,
        created_on: 1609459200,
        updated_by: 1,
        updated_on: 1609459200,
        custom_steps_separated: [
          {
            content: 'Open the login page',
            additional_info: 'Use Chrome browser',
            expected: 'Login page is displayed',
            refs: 'REF-1'
          },
          {
            content: 'Enter valid credentials',
            additional_info: null,
            expected: 'User is logged in',
            refs: null
          }
        ],
        case_ids: [1, 2, 3]
      },
      {
        id: 2,
        title: 'Logout Process',
        project_id: 1,
        created_by: 1,
        created_on: 1609459300,
        updated_by: 1,
        updated_on: 1609459300,
        custom_steps_separated: [
          {
            content: 'Click logout button',
            additional_info: null,
            expected: 'User is logged out',
            refs: null
          }
        ],
        case_ids: [4, 5]
      }
    ];
    mockAxiosInstance.get.mockResolvedValue({ data: mockSharedSteps });
    
    // Test method
    const result = await client.sharedSteps.getSharedSteps(1);
    
    // Verify axios get was called correctly
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/get_shared_steps/1', { params: undefined });
    
    // Verify result
    expect(result).toEqual(mockSharedSteps);
  });

  it('handles errors when retrieving shared steps for a project', async () => {
    // Mock error response
    const mockError = {
      response: {
        status: 400,
        data: { error: 'Invalid or unknown project' }
      }
    };
    mockAxiosInstance.get.mockRejectedValue(mockError);
    
    // Test error handling
    await expect(client.sharedSteps.getSharedSteps(999)).rejects.toThrow();
    
    // Verify axios get was called correctly
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/get_shared_steps/999', { params: undefined });
  });
}); 