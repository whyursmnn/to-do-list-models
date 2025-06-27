// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, logoutUser, getUserInfoFromLocalStorage, getMe } from '../services/authService';
import { useNavigate } from 'react-router-dom';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  const navigate = useNavigate();


  const refreshUser = async () => {
    try {
      const response = await getMe(); 
      
      if (response && response.id && response.role) { 
        localStorage.setItem('user', JSON.stringify(response)); 
        setUser(response); 
        console.log("AuthContext: User data refreshed and validated from backend:", response);
        return response;
      } else {
        
        console.warn('AuthContext: Stored token is invalid or expired after refresh. Clearing session.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null); 
        return null; 
      }
    } catch (err) {
     
      console.error('AuthContext: Error during user refresh/validation:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      throw err; 
    }
  };

  const handleInitialLoad = async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = getUserInfoFromLocalStorage();

    if (storedToken && storedUser && storedUser.id && storedUser.role) {
      setUser(storedUser);
      console.log('AuthContext: Stored user data found. Attempting to refresh/validate session with backend.');

      try {
        
        await refreshUser(); 
      } catch (error) {
        // refreshUser akan menangani pembersihan storage dan setUser(null)
        console.error('AuthContext: Initial refresh/validation failed. User likely needs to re-login.', error);
      }
    } else {
      console.log('AuthContext: No valid token or complete user data found. Ensuring storage is clean.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
    setIsLoading(false); 
  };

  useEffect(() => {
    handleInitialLoad();
  }, []); 

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const userData = await loginUser(username, password);
      setUser(userData);
      console.log("AuthContext: User logged in successfully. Setting user state:", userData);
      return true;
    } catch (error) {
      console.error("AuthContext: Login failed during processing:", error);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log("AuthContext: Attempting logout for user:", user?.username);
    await logoutUser();
    setUser(null);
    console.log("AuthContext: User state cleared, redirecting to login.");
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      login,
      logout,
      isLoading,
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
