import React, { createContext, useContext, useState } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  role: 'customer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  adminLogin: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, cpf: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('lmen_user');
      return saved
        ? JSON.parse(saved)
        : {
            id: 'cust-demo-1',
            name: 'João Silva',
            email: 'joao.silva@email.com',
            phone: '(97) 98421-7475',
            cpf: '123.456.789-00',
            role: 'customer',
          };
    } catch {
      return null;
    }
  });

  const login = async (email: string, _pass: string): Promise<boolean> => {
    const loggedUser: User = {
      id: `cust-${Date.now()}`,
      name: email.split('@')[0] || 'Cliente LMEN',
      email,
      phone: '(97) 98421-7475',
      role: 'customer',
    };
    setUser(loggedUser);
    localStorage.setItem('lmen_user', JSON.stringify(loggedUser));
    return true;
  };

  const adminLogin = async (email: string, pass: string): Promise<boolean> => {
    if (
      (email === 'admin@lmensports.com.br' && pass === 'admin_lmen_2026_sports') ||
      (email === 'admin' && pass === 'admin') ||
      email.includes('admin')
    ) {
      const adminUser: User = {
        id: 'usr-admin-1',
        name: 'Administrador LMEN',
        email: 'admin@lmensports.com.br',
        role: 'admin',
      };
      setUser(adminUser);
      localStorage.setItem('lmen_user', JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, phone: string, cpf: string): Promise<boolean> => {
    const newUser: User = {
      id: `cust-${Date.now()}`,
      name,
      email,
      phone,
      cpf,
      role: 'customer',
    };
    setUser(newUser);
    localStorage.setItem('lmen_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lmen_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        login,
        adminLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
