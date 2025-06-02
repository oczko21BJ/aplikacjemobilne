import { api } from '../services/api';

global.fetch = jest.fn();

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch posts', async () => {
    const mockPosts = [{ id: 1, title: 'Test post' }];
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPosts,
    });

    const response = await api.getPosts();
    expect(fetch).toHaveBeenCalledWith('http://192.168.56.1:3000/posts', {});
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockPosts);
  });

  it('should handle fetch error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const response = await api.getPosts();
    expect(response.success).toBe(false);
    expect(response.message).toBe('Network error');
  });
});
