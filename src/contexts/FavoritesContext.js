import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const FavoritesContext = createContext();

export const useFavorites = () => {
  return useContext(FavoritesContext);
};

export const FavoritesProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [favoriteVenues, setFavoriteVenues] = useState(new Set());
  const [lastPlayedDates, setLastPlayedDates] = useState(new Map());
  const [loading, setLoading] = useState(true);

  // Load favorites and last played dates
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) {
        setFavoriteVenues(new Set());
        setLastPlayedDates(new Map());
        setLoading(false);
        return;
      }

      try {
        // Load favorites
        const favoritesQuery = query(
          collection(db, 'favorites'),
          where('userId', '==', currentUser.uid)
        );
        const favoritesSnapshot = await getDocs(favoritesQuery);
        const venues = new Set();
        favoritesSnapshot.forEach((doc) => {
          venues.add(doc.data().venue);
        });
        setFavoriteVenues(venues);

        // Load last played dates from results
        const resultsQuery = query(
          collection(db, 'results'),
          where('userId', '==', currentUser.uid)
        );
        const resultsSnapshot = await getDocs(resultsQuery);
        const lastPlayed = new Map();
        
        resultsSnapshot.forEach((doc) => {
          const data = doc.data();
          const venue = data.venue;
          const date = new Date(data.date);
          
          if (!lastPlayed.has(venue) || lastPlayed.get(venue) < date) {
            lastPlayed.set(venue, date);
          }
        });
        
        setLastPlayedDates(lastPlayed);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  const toggleFavorite = async (venue) => {
    if (!currentUser) return;

    const isFavorite = favoriteVenues.has(venue);
    
    try {
      if (isFavorite) {
        // Remove favorite
        const favoritesQuery = query(
          collection(db, 'favorites'),
          where('userId', '==', currentUser.uid),
          where('venue', '==', venue)
        );
        const snapshot = await getDocs(favoritesQuery);
        
        for (const docRef of snapshot.docs) {
          await deleteDoc(docRef.ref);
        }
        
        setFavoriteVenues(prev => {
          const newSet = new Set(prev);
          newSet.delete(venue);
          return newSet;
        });
      } else {
        // Add favorite
        await addDoc(collection(db, 'favorites'), {
          userId: currentUser.uid,
          venue: venue,
          createdAt: new Date().toISOString()
        });
        
        setFavoriteVenues(prev => new Set([...prev, venue]));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isFavorite = (venue) => {
    return favoriteVenues.has(venue);
  };

  const getLastPlayedDate = (venue) => {
    return lastPlayedDates.get(venue);
  };

  const getLastPlayedText = (venue) => {
    const lastPlayed = getLastPlayedDate(venue);
    if (!lastPlayed) return null;
    
    const now = new Date();
    const diffTime = Math.abs(now - lastPlayed);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Played today';
    if (diffDays === 1) return 'Played yesterday';
    if (diffDays < 7) return `Played ${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Played ${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Played ${months} month${months > 1 ? 's' : ''} ago`;
    }
    
    const years = Math.floor(diffDays / 365);
    return `Played ${years} year${years > 1 ? 's' : ''} ago`;
  };

  const sortGamesByFavorites = (games) => {
    return games.sort((a, b) => {
      const aIsFavorite = isFavorite(a.venue);
      const bIsFavorite = isFavorite(b.venue);
      
      // Favorites first
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      // Then by time
      return new Date(`1970/01/01 ${a.game_time}`) - new Date(`1970/01/01 ${b.game_time}`);
    });
  };

  const value = {
    favoriteVenues,
    toggleFavorite,
    isFavorite,
    getLastPlayedDate,
    getLastPlayedText,
    sortGamesByFavorites,
    loading
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};