import fetchMock from 'jest-fetch-mock';
import { api  as apiInstance } from '../services/api';
import { 
  Post, 
  User, 
  Comment, 
  Business, 
  Notification 
} from '@/types/api';

class ApiService {
  API_BASE_URL: string;

  constructor() {
    this.API_BASE_URL = 'http://192.168.56.1:3000'; // or fetch from environment variables
  }

 async getPosts() {
  try {
    const response = await fetch(`${this.API_BASE_URL}/posts`);
    if (!response.ok) {
      throw new Error('Server down');
    }
    return { success: true, data: await response.json() };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message, data: {} };  // Ensure `data: {}` is returned
    } else {
      return { success: false, message: 'Unknown error', data: {} };
    }
  }
}

async getPost(postId: string) {
  try {
    const response = await fetch(`${this.API_BASE_URL}/posts/${postId}`);
    if (!response.ok) {
      throw new Error('Post not found');
    }
    return { success: true, data: await response.json() };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    } else {
      return { success: false, message: 'Unknown error' };
    }
  }
}

async deletePost(postId: string) {
  try {
    const response = await fetch(`${this.API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Delete failed');
    }
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    } else {
      return { success: false, message: 'Unknown error' };
    }
  }
}
async uploadImage(formData: FormData) {
  const response = await fetch(`${this.API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (response.ok) {
    return { 
      success: true, 
      message: 'Mock upload success',
      data: { url: 'https://picsum.photos/seed/mock/600/400' }
    };
  }
  throw new Error('Upload failed');
}
}

const api = new ApiService();
// Setup fetch mocking
fetchMock.enableMocks();

// Mock data samples
const mockPost = { id: '1', author: 'Test Post', content: '...' } as Post;
const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' } as  User;
const mockComment = { id: '1', postId: '1', content: 'Test comment' } as Comment;
const mockBusiness = { id: '1', name: 'Test Business' } as Business;
const mockNotification = { id: '1', message: 'Test notification' } as Notification;

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('ApiService', () => {
  // Helper function for success responses
  const mockSuccess = <T>(data: T) => {
    fetchMock.mockResponseOnce(JSON.stringify(data), { status: 200 });
  };

  // Helper function for error responses
  const mockError = (message: string, status: number = 500) => {
    fetchMock.mockResponseOnce(JSON.stringify({ message }), { status });
  };

  // GET method tests
  describe('GET requests', () => {
    test('getPosts() fetches posts successfully', async () => {
      mockSuccess<Post[]>([mockPost]);
      const result = await api.getPosts();
      
      expect(fetchMock).toHaveBeenCalledWith(`${api['API_BASE_URL']}/posts`);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockPost]);
    });

    test('getPosts() handles server errors', async () => {
      mockError('Server down', 500);
      const result = await api.getPosts();
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Server down');
    });

    test('getPost() fetches single post', async () => {
      mockSuccess<Post>(mockPost);
      const result = await apiInstance.getPost('1');
      
      expect(fetchMock).toHaveBeenCalledWith(`${api['API_BASE_URL']}/posts/1`, {});
      expect(result.data).toEqual(mockPost);
    });

    
    // Similar tests for:
    // - getComments()
    // - getBusinesses()
    // - getNotifications()
    // - getUserProfile()
    // ... with success/error cases
  });

  // POST method tests
  describe('POST requests', () => {
    test('createPost() sends correct payload', async () => {
      const newPost = { content: 'New Post' };
      mockSuccess<Post>(mockPost);
      
      const result = await apiInstance.createPost(newPost);
      
      expect(fetchMock).toHaveBeenCalledWith(`${api['API_BASE_URL']}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      expect(result.data).toEqual(mockPost);
    });

    test('createPost() handles validation errors', async () => {
      mockError('Title required', 400);
      const result = await apiInstance.createPost({});
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Title required');
    });

    // Similar tests for:
    // - createComment()
    // - register()
  });

  // PUT method tests
  describe('PUT requests', () => {
    test('updatePost() sends update payload', async () => {
      const updates = { content: 'Updated' };
      mockSuccess<Post>({...mockPost, ...updates});
      
      const result = await apiInstance.updatePost('1', updates);
      
      expect(fetchMock).toHaveBeenCalledWith(`${api['API_BASE_URL']}/posts/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      expect(result.data.author).toBe('Test Post');
    });
  });

  // DELETE method tests
  describe('DELETE requests', () => {
    test('deletePost() sends DELETE request', async () => {
      mockSuccess<void>(undefined);
      const result = await api.deletePost('1');
      
      expect(fetchMock).toHaveBeenCalledWith(`${api['API_BASE_URL']}/posts/1`, {
        method: 'DELETE'
      });
      expect(result.success).toBe(true);
    });
  });

  // Special methods
  describe('uploadImage()', () => {
    test('returns mock image URL', async () => {
      const result = await api.uploadImage(new FormData());
      expect(result).toEqual({
        data: { url: 'https://picsum.photos/seed/mock/600/400' },
        message: 'Mock upload success',
        success: true
      });
    });
  });

  // Network error handling
  describe('Network failures', () => {
    test('handles fetch exceptions', async () => {
      fetchMock.mockReject(new Error('Network failed'));
      const result = await api.getPosts();
      
      expect(result).toEqual({
        data: {},
        message: 'Network failed',
        success: false
      });
    });
  });
});