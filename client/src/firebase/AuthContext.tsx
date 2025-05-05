import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, getCurrentUser } from './auth';
import { db } from './config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Theme } from '../helpers/types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  updateTheme: (theme: Theme) => Promise<void>;
  theme: Theme;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  updateTheme: async (theme: Theme) => {},
  theme: Theme.Light
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<Theme>(Theme.Light);

  const updateTheme = async (theme: Theme) => {
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { theme });
      } 
      catch (error) {
        console.error("Error updating dark mode preference:", error);
      }
    }
    setTheme(theme);
  };

  const updateUserPreferences = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        setTheme(userSnap.data().theme);
      }
    }
    catch (error) {
      console.error("Error fetching user preferences:", error);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();

    if (user) {
      setCurrentUser(user);
      updateUserPreferences(user.uid);
    }

    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);

      if (user) {
        updateUserPreferences(user.uid);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    theme,
    updateTheme
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
