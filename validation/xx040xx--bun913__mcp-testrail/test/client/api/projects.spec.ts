import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupMocks, createTestClient } from './testHelper';

describe('Projects API', () => {
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

  it('retrieves a specific project', async () => {
    // Mock response
    const mockProject = {
      id: 1,
      name: 'Project 1',
      announcement: '',
      show_announcement: false,
      is_completed: false,
      completed_on: null,
      suite_mode: 1,
      url: 'http://example.com/project/1'
    };
    mockAxiosInstance.get.mockResolvedValue({ data: mockProject });
    
    // Test method
    const result = await client.projects.getProject(1);
    
    // Verify axios get was called correctly
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/get_project/1');
    
    // Verify result
    expect(result).toEqual(mockProject);
  });
  
  it('handles errors when retrieving a specific project', async () => {
    // Mock error response (404 - project not found)
    const mockError = {
      response: {
        status: 404,
        data: { error: 'Project not found' }
      }
    };
    mockAxiosInstance.get.mockRejectedValue(mockError);
    
    // Test error handling
    await expect(client.projects.getProject(999)).rejects.toThrow();
    
    // Verify axios get was called correctly
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/get_project/999');
  });
  
  it('retrieves all projects', async () => {
    // Mock response
    const mockProjects = [
      { id: 1, name: 'Project 1', announcement: '', show_announcement: false, is_completed: false, completed_on: null, suite_mode: 1, url: 'http://example.com/project/1' },
      { id: 2, name: 'Project 2', announcement: '', show_announcement: false, is_completed: false, completed_on: null, suite_mode: 1, url: 'http://example.com/project/2' }
    ];
    mockAxiosInstance.get.mockResolvedValue({ data: mockProjects });
    
    // Test method
    const result = await client.projects.getProjects();
    
    // Verify axios get was called correctly
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/get_projects', expect.anything());
    
    // Verify result
    expect(result).toEqual(mockProjects);
  });
}); 