import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider
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

    // Send email verification
    // Note: Firebase hosts the verification handler at firebaseapp.com/__/auth/action
    // After clicking the link, Firebase will redirect back to the continueUrl
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/dashboard`, // Where to go after verification
        handleCodeInApp: false
      });
    } catch (verificationError) {
      console.error('Error sending verification email:', verificationError);
      // Don't fail signup if verification email fails
      // User can resend from dashboard
    }

    const profileData = {
      displayName,
      email,
      region,
      receiveNotifications,
      isPremium: false,
      createdAt: new Date().toISOString(),
      emailVerified: false
    };

    await setDoc(doc(db, 'users', user.uid), profileData);

    // Immediately set the user profile in state to avoid race condition
    setUserProfile(profileData);

    // Cache the profile
    try {
      const cacheKey = `userProfile_${user.uid}`;
      localStorage.setItem(cacheKey, JSON.stringify(profileData));
      localStorage.setItem(`${cacheKey}_expiry`, (new Date().getTime() + 24 * 60 * 60 * 1000).toString());
    } catch (e) {
      console.warn('Failed to cache new profile:', e);
    }

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

  const resendVerification = async () => {
    if (currentUser && !currentUser.emailVerified) {
      try {
        await sendEmailVerification(currentUser, {
          url: `${window.location.origin}/dashboard`, // Where to go after verification
          handleCodeInApp: false
        });
        return { success: true };
      } catch (error) {
        console.error('Error resending verification email:', error);
        throw error;
      }
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user profile already exists
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // New Google user - create profile
      // Note: Google users are already email verified
      const profileData = {
        displayName: user.displayName,
        email: user.email,
        region: '', // Will be prompted to select region
        receiveNotifications: true,
        isPremium: false,
        createdAt: new Date().toISOString(),
        emailVerified: true, // Google users are pre-verified
        authProvider: 'google'
      };

      await setDoc(docRef, profileData);

      // Immediately set the user profile in state
      setUserProfile(profileData);

      // Cache the profile
      try {
        const cacheKey = `userProfile_${user.uid}`;
        localStorage.setItem(cacheKey, JSON.stringify(profileData));
        localStorage.setItem(`${cacheKey}_expiry`, (new Date().getTime() + 24 * 60 * 60 * 1000).toString());
      } catch (e) {
        console.warn('Failed to cache new profile:', e);
      }
    }

    return result;
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
            const parsedData = JSON.parse(cachedData);
            setUserProfile(parsedData);

            // Check if we need to sync email verification status
            if (parsedData.emailVerified !== user.emailVerified) {
              syncEmailVerificationStatus(user, parsedData);
            }
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
            emailVerified: user.emailVerified,
            isPremium: false,
            createdAt: new Date().toISOString()
          };
          await setDoc(docRef, profileData);
        }

        // Sync email verification status if different
        if (profileData.emailVerified !== user.emailVerified) {
          profileData = await syncEmailVerificationStatus(user, profileData);
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

  const syncEmailVerificationStatus = async (user, currentProfile) => {
    if (user && currentProfile && currentProfile.emailVerified !== user.emailVerified) {
      try {
        const docRef = doc(db, 'users', user.uid);
        const updatedData = {
          emailVerified: user.emailVerified,
          updatedAt: new Date().toISOString()
        };

        await updateDoc(docRef, updatedData);

        // Return updated profile data
        return { ...currentProfile, ...updatedData };
      } catch (error) {
        console.error('Error syncing email verification status:', error);
        return currentProfile;
      }
    }
    return currentProfile;
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

  // Auto-refresh email verification status when user returns to the app
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && currentUser && !currentUser.emailVerified) {
        try {
          // Reload user to get fresh email verification status
          await currentUser.reload();
          // This will trigger onAuthStateChanged if status changed
        } catch (error) {
          console.error('Error refreshing email verification status:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser]);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    resetPassword,
    resendVerification,
    signInWithGoogle,
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