import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, setDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiCheckCircle, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  generateGameId,
  getWeekOf,
  getExpirationTime,
  isConfirmationExpired,
  getTimeAgo,
  hasUserConfirmed,
} from '../../utils/gameConfirmations';

const GameConfirmButton = ({ game, region }) => {
  const { currentUser } = useAuth();
  const [confirmationData, setConfirmationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userHasConfirmed, setUserHasConfirmed] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const gameId = generateGameId(game);
  const weekOf = getWeekOf(game.day, game.game_time);

  // Fetch confirmation data for this game
  useEffect(() => {
    const fetchConfirmations = async () => {
      try {
        console.log('Fetching confirmations for:', { gameId, weekOf });

        const q = query(
          collection(db, 'gameConfirmations'),
          where('gameId', '==', gameId),
          where('weekOf', '==', weekOf)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          const docId = snapshot.docs[0].id;

          console.log('Found confirmation data:', data);

          // Check if expired
          if (isConfirmationExpired(data.expiresAt)) {
            console.log('Confirmation expired');
            setConfirmationData(null);
            setUserHasConfirmed(false);
          } else {
            console.log('Setting confirmation data, count:', data.confirmCount);
            console.log('Full confirmation data:', { ...data, docId });
            setConfirmationData({ ...data, docId });
            const hasConfirmed = currentUser ? hasUserConfirmed(data.confirmations, currentUser.uid) : false;
            console.log('User has confirmed:', hasConfirmed);
            console.log('Current user ID:', currentUser?.uid);
            setUserHasConfirmed(hasConfirmed);
          }
        } else {
          console.log('No confirmation data found');
          setConfirmationData(null);
          setUserHasConfirmed(false);
        }
      } catch (error) {
        console.error('Error fetching confirmations:', error);
        toast.error('Failed to load confirmation data');
      }
    };

    fetchConfirmations();
  }, [gameId, weekOf, currentUser, refetchTrigger]);

  const handleConfirm = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error('Please log in to confirm games');
      return;
    }

    if (userHasConfirmed) {
      toast('You already confirmed this game this week', { icon: 'ℹ️' });
      return;
    }

    setLoading(true);

    try {
      const confirmation = {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        confirmedAt: new Date().toISOString(),
      };

      const docRef = doc(db, 'gameConfirmations', `${gameId}-${weekOf}`);

      console.log('Attempting to save confirmation:', {
        gameId,
        weekOf,
        docId: `${gameId}-${weekOf}`,
        confirmation,
      });

      if (confirmationData) {
        // Update existing document
        console.log('Updating existing document');
        await updateDoc(docRef, {
          confirmations: arrayUnion(confirmation),
          confirmCount: (confirmationData.confirmCount || 0) + 1,
          lastConfirmedAt: confirmation.confirmedAt,
        });
      } else {
        // Create new document
        console.log('Creating new document');
        const newConfirmation = {
          gameId,
          venue: game.venue,
          competition: game.competition,
          day: game.day,
          game_time: game.game_time,
          region,
          weekOf,
          confirmations: [confirmation],
          confirmCount: 1,
          lastConfirmedAt: confirmation.confirmedAt,
          expiresAt: getExpirationTime(game.day, game.game_time),
          createdAt: new Date().toISOString(),
        };

        await setDoc(docRef, newConfirmation);
      }

      console.log('Confirmation saved successfully, waiting before refetch...');

      // Wait a moment for Firestore to process, then trigger refetch
      setTimeout(() => {
        console.log('Triggering refetch...');
        setRefetchTrigger(prev => prev + 1);
      }, 500);

      toast.success('Thanks for confirming this game is running!');
    } catch (error) {
      console.error('Error confirming game:', error);
      console.error('Error details:', error.message, error.code);
      toast.error(`Failed to confirm game: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Use the same completion logic as GameList's getTimeUntil function
  // Don't show for games that are "Completed" (started more than 5 hours ago)
  const now = new Date();
  const gameDate = new Date(`1970/01/01 ${game.game_time}`);
  gameDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = gameDate - now;
  const diffHrs = Math.floor(diffMs / 1000 / 60 / 60);

  // If game started more than 5 hours ago, it's completed - don't show button
  if (diffHrs < -5) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Confirmation status */}
      {confirmationData && confirmationData.confirmCount > 0 && (
        <div className="flex items-start justify-center gap-2 text-sm py-2 px-3 bg-green-900 bg-opacity-20 border border-green-600 rounded-lg">
          <FiCheckCircle className="text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col items-center">
            <span className="text-green-400 font-semibold">
              Likely running now. {confirmationData.confirmCount} player{confirmationData.confirmCount !== 1 ? 's' : ''} confirmed.
            </span>
            <span className="text-gray-400 text-xs">
              {getTimeAgo(confirmationData.lastConfirmedAt)}
            </span>
          </div>
        </div>
      )}

      {/* Confirm button */}
      {currentUser && (
        <button
          onClick={handleConfirm}
          disabled={loading || userHasConfirmed}
          className={`btn btn-sm w-full ${
            userHasConfirmed
              ? 'btn-success btn-outline cursor-default'
              : 'btn-outline btn-primary hover:btn-primary'
          }`}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              Confirming...
            </>
          ) : userHasConfirmed ? (
            <>
              <FiCheckCircle className="mr-1" />
              Confirmed
            </>
          ) : (
            <>
              <FiUsers className="mr-1" />
              Confirm Game
            </>
          )}
        </button>
      )}

      {!currentUser && confirmationData && confirmationData.confirmCount > 0 && (
        <p className="text-center text-xs text-gray-500">
          Log in to confirm games
        </p>
      )}
    </div>
  );
};

export default GameConfirmButton;
