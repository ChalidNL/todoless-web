import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock PocketBase SDK (shared with other tests)
const mockCollection = {
  getFullList: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock('../pocketbase', () => ({
  pb: {
    collection: vi.fn(() => mockCollection),
    authStore: {
      token: 'mock-token',
      isValid: true,
      record: { id: 'user1', email: 'test@test.com', name: 'Test', role: 'admin' },
      clear: vi.fn(),
    },
  },
}));

// Import after mock
import { pb } from '../pocketbase';

// Dynamically import the client
let api: any;

describe('PocketBase Projects API', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    // Reset auth state
    (pb.authStore as any).isValid = true;
    (pb.authStore as any).record = { id: 'user1', email: 'test@test.com', name: 'Test', role: 'admin' };
    const mod = await import('../pocketbase-client');
    api = mod.api;
  });

  describe('getProjects', () => {
    it('fetches and normalizes projects', async () => {
      const mockProjects = [
        {
          id: 'p1',
          title: 'Test Project',
          description: 'A test project',
          color: '#ff0000',
          status: 'active',
          task_ids: ['t1', 't2'],
          due_date: null,
          created: '2025-01-01T00:00:00Z',
          user: 'user1',
        },
      ];
      mockCollection.getFullList.mockResolvedValue(mockProjects);

      const result = await api.getProjects();

      expect(pb.collection).toHaveBeenCalledWith('projects');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'p1',
        title: 'Test Project',
        description: 'A test project',
        color: '#ff0000',
        status: 'active',
        taskIds: ['t1', 't2'],
        dueDate: undefined,
        createdAt: new Date('2025-01-01T00:00:00Z').getTime(),
        createdBy: 'user1',
      });
    });
  });

  describe('createProject', () => {
    it('creates a project with required fields', async () => {
      mockCollection.create.mockResolvedValue({ id: 'p1' });

      await api.createProject({
        title: 'New Project',
        description: 'Description',
        color: '#6366f1',
        status: 'active',
        taskIds: [],
      });

      expect(pb.collection).toHaveBeenCalledWith('projects');
      expect(mockCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Project',
          description: 'Description',
          color: '#6366f1',
          status: 'active',
          task_ids: [],
          user: 'user1',
        })
      );
    });
  });

  describe('updateProject', () => {
    it('updates project fields', async () => {
      mockCollection.update.mockResolvedValue({ id: 'p1' });

      await api.updateProject('p1', { status: 'completed' });

      expect(pb.collection).toHaveBeenCalledWith('projects');
      expect(mockCollection.update).toHaveBeenCalledWith('p1', expect.objectContaining({
        status: 'completed',
      }));
    });
  });

  describe('deleteProject', () => {
    it('deletes a project', async () => {
      mockCollection.delete.mockResolvedValue(true);

      await api.deleteProject('p1');

      expect(pb.collection).toHaveBeenCalledWith('projects');
      expect(mockCollection.delete).toHaveBeenCalledWith('p1');
    });
  });
});
