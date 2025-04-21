export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  address: string;
  joinDate: string;
  isVerified: boolean;
}

export interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  location: string;
  type: 'general' | 'alert' | 'event';
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  hours: string;
  image: string;
  isOpen: boolean;
  description: string;
}

export interface Notification {
  id: string;
  type: 'alert' | 'event' | 'social' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}