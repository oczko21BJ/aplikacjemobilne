import { User, Post, Comment, Business, Notification, ApiResponse } from '@/types/api';

const API_BASE_URL = 'http://192.168.56.1:3000'; 
class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const data = await response.json();

      if (!response.ok) {
        return {
          data: {} as T,
          message: data?.message || 'API request failed',
          success: false,
        };
      }

      return {
        data,
        message: 'Success',
        success: true,
      };
    } catch (error: any) {
      return {
        data: {} as T,
        message: error.message || 'Network error',
        success: false,
      };
    }
  }

  // GET methods
  async getPosts(): Promise<ApiResponse<Post[]>> {
    return this.request<Post[]>('/posts');
  }

  async getPost(id: string): Promise<ApiResponse<Post>> {
    return this.request<Post>(`/posts/${id}`);
  }

  async getComments(postId: string): Promise<ApiResponse<Comment[]>> {
    return this.request<Comment[]>(`/posts/${postId}/comments`);
  }

  async getBusinesses(): Promise<ApiResponse<Business[]>> {
    return this.request<Business[]>('/businesses');
  }

  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.request<Notification[]>('/notifications');
  }

  async getUserProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/profile');
  }

  // POST methods
  async createPost(postData: Partial<Post>): Promise<ApiResponse<Post>> {
    return this.request<Post>('/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
  }

  async createComment(commentData: Partial<Comment>): Promise<ApiResponse<Comment>> {
    return this.request<Comment>('/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    });
  }

  async register(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  }

  // PUT methods
  async updatePost(id: string, postData: Partial<Post>): Promise<ApiResponse<Post>> {
    return this.request<Post>(`/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
  }

  async updateProfile(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  }

  // DELETE (optional)
  async deletePost(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  // File/image uploads (simulate for json-server)
  async uploadImage(imageData: FormData): Promise<ApiResponse<{ url: string }>> {
    // Mocked example - json-server doesn’t handle real uploads
    return {
      data: { url: 'https://picsum.photos/seed/mock/600/400' },
      message: 'Mock upload success',
      success: true,
    };
  }
}

export const api = new ApiService();
