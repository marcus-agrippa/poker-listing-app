import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, displayName, region, receiveNotifications = true) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName });
    
    // Send email verification with homepage redirect
    await sendEmailVerification(user, {
      url: window.location.origin,
      handleCodeInApp: false
    });
    
    await setDoc(doc(db, 'users', user.uid), {
      displayName,
      email,
      region,
      receiveNotifications,
      createdAt: new Date().toISOString(),
      emailVerified: false
    });

    return userCredential;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const resendVerification = () => {
    if (currentUser && !currentUser.emailVerified) {
      return sendEmailVerification(currentUser, {
        url: window.location.origin,
        handleCodeInApp: false
      });
    }
  };

  const loadUserProfile = async (user) => {
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        } else {
          // If user profile doesn't exist, create one
          const newProfile = {
            displayName: user.displayName,
            email: user.email,
            region: '',
            createdAt: new Date().toISOString()
          };
          await setDoc(docRef, newProfile);
          setUserProfile(newProfile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    } else {
      setUserProfile(null);
    }
  };

  const updateUserProfile = async (updates) => {
    if (!currentUser) return;
    
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setUserProfile(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      loadUserProfile(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    resetPassword,
    resendVerification,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};