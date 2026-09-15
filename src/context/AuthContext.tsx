import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { ensureFirebaseAuth } from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (loginId: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  hasPermission: (module: string, action: 'view' | 'create' | 'edit' | 'delete' | 'print' | 'export') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(StorageService.getAuthSession());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(StorageService.getAuthSession()));

  useEffect(() => {
    const session = StorageService.getAuthSession();
    if (session) {
      setCurrentUser(session);
      setIsAuthenticated(true);
      ensureFirebaseAuth();
    }
  }, []);

  const login = (loginId: string, pass: string): { success: boolean; error?: string } => {
    const res = StorageService.authenticate(loginId, pass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      ensureFirebaseAuth();
      return { success: true };
    }
    return { success: false, error: res.error || 'Authentication failed' };
  };

  const logout = () => {
    if (currentUser) {
      StorageService.logActivity(currentUser, 'LOGOUT', 'Authentication', 'Flight deck session terminated');
    }
    StorageService.clearAuthSession();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (_module: string, _action: 'view' | 'create' | 'edit' | 'delete' | 'print' | 'export'): boolean => {
    // Admin has full authorized access to all ERP modules
    return true;
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

