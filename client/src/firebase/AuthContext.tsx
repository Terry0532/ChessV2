import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { onAuthStateChange } from "./auth";
import { db, rtdb } from "./config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Theme } from "../helpers/types";
import { onDisconnect, ref, serverTimestamp, set } from "firebase/database";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  updateTheme: (theme: Theme) => Promise<void>;
  theme: Theme;
  updateSocketId: (socketId: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  updateTheme: async (theme: Theme) => {},
  theme: Theme.Light,
  updateSocketId: (socketId: string) => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<Theme>(Theme.Light);
  const [socketId, setSocketId] = useState<string | null>(null);

  const updateSocketId = (newSocketId: string) => {
    setSocketId(newSocketId);
  };

  const updateUserPresence = async (user: User, clientSocketId: string) => {
    try {
      const userStatusRef = ref(rtdb, `status/${user.uid}`);

      await set(userStatusRef, {
        state: "online",
        displayName: user.displayName || user.email,
        lastChanged: serverTimestamp(),
        socketId: clientSocketId,
      });

      onDisconnect(userStatusRef).set({
        state: "offline",
        lastChanged: serverTimestamp(),
        socketId: null,
      });
    } catch (error) {
      console.error("Error updating user presence:", error);
    }
  };

  const updateTheme = async (theme: Theme) => {
    if (currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { theme });
      } catch (error) {
        console.error("Error updating dark mode preference:", error);
      }
    }
    setTheme(theme);
  };

  const updateUserPreferences = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setTheme(userSnap.data().theme);
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);

      if (user) {
        try {
          updateUserPreferences(user.uid);
          if (socketId) {
            updateUserPresence(user, socketId);
          }
        } catch (error) {
          console.error("Error in auth state change:", error);
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [socketId]);

  const value = {
    currentUser,
    loading,
    theme,
    updateTheme,
    updateSocketId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
