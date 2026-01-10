"use client";

import axiosInstance from "@/lib/axiosInstance";
import { UserRole } from "@/types/enums/role.enum";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
   id: string;
   name: string;
   email: string;
   role: UserRole;
}

interface AuthContextType {
   user: User | null;
   loading: boolean;
   isAuthenticated: boolean;
   login: (email: string, password: string) => Promise<void>;
   signup: (name: string, email: string, password: string) => Promise<void>;
   adminLogin: (password: string) => Promise<void>;
   logout: () => Promise<void>;
   checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
   const context = useContext(AuthContext);
   if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
   }
   return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(true);
   const [isAuthenticated, setIsAuthenticated] = useState(false);

   const checkAuth = async () => {
      try {
         const response = await axiosInstance.get("/auth/me");
         if (response.data.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
         }
      } catch (error) {
         setUser(null);
         setIsAuthenticated(false);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      checkAuth();
   }, []);

   const login = async (email: string, password: string) => {
      const response = await axiosInstance.post("/auth/signin", { email, password });
      if (response.data.success) {
         setUser(response.data.user);
         setIsAuthenticated(true);
      }
   };

   const signup = async (name: string, email: string, password: string) => {
      const response = await axiosInstance.post("/auth/signup", { name, email, password });
      if (response.data.success) {
         setUser(response.data.user);
         setIsAuthenticated(true);
      }
   };

   const adminLogin = async (password: string) => {
      const response = await axiosInstance.post("/auth/admin/login", { password });
      if (response.data.success) {
         setUser(response.data.user);
         setIsAuthenticated(true);
      }
   };

   const logout = async () => {
      await axiosInstance.post("/auth/logout");
      setUser(null);
      setIsAuthenticated(false);
   };

   return (
      <AuthContext.Provider
         value={{
            user,
            loading,
            isAuthenticated,
            login,
            signup,
            adminLogin,
            logout,
            checkAuth,
         }}
      >
         {children}
      </AuthContext.Provider>
   );
};
