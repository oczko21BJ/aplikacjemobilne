// context/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: number;
  name: string;
  email: string;
  address?: string;
  joinDate?: string;
  avatar?: string;
  isVerified?: boolean;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUserState(JSON.parse(userData));
    };
    loadUser();
  }, []);

  const setUser = async (user: User | null) => {
    if (user) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem('user');
    }
    setUserState(user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUserState(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
