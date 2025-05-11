import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, rtdb } from './config';
import { ref, serverTimestamp, set } from 'firebase/database';

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  }
  catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const createUserWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    return { success: true, user: userCredential.user };
  }
  catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return { success: true, user: userCredential.user };
  }
  catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const signOutUser = async () => {
  try {
    const user = auth.currentUser;
    
    if (user) {
      const userStatusRef = ref(rtdb, `status/${user.uid}`);
      await set(userStatusRef, {
        state: 'offline',
        displayName: user.displayName || user.email,
        lastChanged: serverTimestamp(),
        socketId: null
      });
    }
    
    await signOut(auth);
    return { success: true };
  }
  catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
