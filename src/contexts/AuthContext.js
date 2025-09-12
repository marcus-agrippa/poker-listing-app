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
        // Check localStorage cache first
        const cacheKey = `userProfile_${user.uid}`;
        let cachedData, cacheExpiry;
        
        try {
          cachedData = localStorage.getItem(cacheKey);
          cacheExpiry = localStorage.getItem(`${cacheKey}_expiry`);
        } catch (e) {
          console.warn('localStorage not available:', e);
          cachedData = null;
          cacheExpiry = null;
        }
        
        if (cachedData && cacheExpiry && new Date().getTime() < parseInt(cacheExpiry)) {
          try {
            // Use cached data
            setUserProfile(JSON.parse(cachedData));
            return;
          } catch (e) {
            console.warn('Failed to parse cached profile data:', e);
            // Continue to fetch from Firestore
          }
        }

        // Cache miss or expired - fetch from Firestore
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        let profileData;
        
        if (docSnap.exists()) {
          profileData = docSnap.data();
        } else {
          // If user profile doesn't exist, create one
          profileData = {
            displayName: user.displayName,
            email: user.email,
            region: '',
            createdAt: new Date().toISOString()
          };
          await setDoc(docRef, profileData);
        }
        
        setUserProfile(profileData);
        
        // Cache for 24 hours
        try {
          localStorage.setItem(cacheKey, JSON.stringify(profileData));
          localStorage.setItem(`${cacheKey}_expiry`, (new Date().getTime() + 24 * 60 * 60 * 1000).toString());
        } catch (e) {
          console.warn('Failed to cache profile data:', e);
          // Continue without caching - app still works
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    } else {
      setUserProfile(null);
      // Clear cache when user logs out
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('userProfile_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('Failed to clear profile cache:', e);
        // Continue - logout still works
      }
    }
  };

  const updateUserProfile = async (updates) => {
    if (!currentUser) return;
    
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      const updatedProfile = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(docRef, updatedProfile);
      
      // Update local state
      const newProfile = { ...userProfile, ...updatedProfile };
      setUserProfile(newProfile);
      
      // Update cache
      try {
        const cacheKey = `userProfile_${currentUser.uid}`;
        localStorage.setItem(cacheKey, JSON.stringify(newProfile));
        localStorage.setItem(`${cacheKey}_expiry`, (new Date().getTime() + 24 * 60 * 60 * 1000).toString());
      } catch (e) {
        console.warn('Failed to update profile cache:', e);
        // Continue - profile update still works
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const deactivateAccount = async () => {
    if (!currentUser) return;
    
    try {
      // Mark account as deactivated in Firestore
      await updateUserProfile({
        isDeactivated: true,
        deactivatedAt: new Date().toISOString(),
        deactivationReason: 'User requested deactivation'
      });
      
      // Sign out the user
      await signOut(auth);
      
      return true;
    } catch (error) {
      console.error('Error deactivating account:', error);
      throw error;
    }
  };

  const reactivateAccount = async (email, password) => {
    try {
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if account was deactivated
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.isDeactivated) {
          // Reactivate the account
          await updateDoc(docRef, {
            isDeactivated: false,
            reactivatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          
          return { success: true, wasDeactivated: true };
        }
      }
      
      return { success: true, wasDeactivated: false };
    } catch (error) {
      console.error('Error reactivating account:', error);
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
    updateUserProfile,
    deactivateAccount,
    reactivateAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};