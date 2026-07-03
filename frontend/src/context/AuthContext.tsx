import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Role = 'ADMIN' | 'NORMAL' | 'STORE_OWNER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app with HttpOnly cookies, we would have a /me endpoint 
    // to check session on page load. For simplicity here, we might just store
    // user data in localStorage while keeping the JWT in HttpOnly cookies.
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      // Handle the previous bug where { message, user } was cached
      if (parsed.user && parsed.message) {
        setUser(parsed.user);
        localStorage.setItem('user', JSON.stringify(parsed.user));
      } else {
        setUser(parsed);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
