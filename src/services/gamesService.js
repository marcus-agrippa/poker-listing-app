import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

// Configuration for region data files
const REGION_CONFIG = {
  'Central Coast': '/data.json',
  'Newcastle': '/data-newcastle.json',
  'Ballarat': '/data-ballarat.json',
  'Wollongong': '/data-wollongong.json',
  'Townsville': '/data-townsville.json',
  'Sunshine Coast': '/data-sunshine-coast.json',
  'Perth': '/data-perth.json',
  'Geelong': '/data-geelong.json',
  'Gold Coast': '/data-gold-coast.json',
  'Brisbane': '/data-brisbane.json',
  'Sydney': '/data-sydney.json',
  'Melbourne': '/data-melbourne.json',
  'Adelaide': '/data-adelaide.json',
  'Canberra': '/data-canberra.json',
};

// Flag to control data source (can be toggled when ready to migrate)
const USE_FIRESTORE = false; // Set to true when migrating to Firestore

export const gamesService = {
  /**
   * Get all games for a specific region
   */
  async getGamesByRegion(region) {
    if (USE_FIRESTORE) {
      return await this._getGamesFromFirestore(region);
    } else {
      return await this._getGamesFromJSON(region);
    }
  },

  /**
   * Get games managed by a specific operator
   */
  async getOperatorGames(operatorId) {
    if (USE_FIRESTORE) {
      const q = query(
        collection(db, 'games'),
        where('operatorId', '==', operatorId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      // For JSON mode, we'll store operator games in Firestore separately
      const q = query(
        collection(db, 'operatorGames'),
        where('operatorId', '==', operatorId),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  },

  /**
   * Get pending submissions for an operator
   */
  async getOperatorSubmissions(operatorId) {
    const q = query(
      collection(db, 'gameSubmissions'),
      where('operatorId', '==', operatorId),
      where('status', '==', 'pending')
      // orderBy removed temporarily until index is created
    );
    const snapshot = await getDocs(q);
    // Sort in memory instead
    const submissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  },

  /**
   * Get submission history for an operator (approved/rejected)
   */
  async getOperatorSubmissionHistory(operatorId) {
    const q = query(
      collection(db, 'gameSubmissions'),
      where('operatorId', '==', operatorId)
      // Get all submissions, will filter in memory
    );
    const snapshot = await getDocs(q);
    // Filter for approved/rejected and sort by date
    const submissions = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(sub => sub.status === 'approved' || sub.status === 'rejected')
      .sort((a, b) => {
        const dateA = new Date(a.approvedAt || a.rejectedAt || a.submittedAt);
        const dateB = new Date(b.approvedAt || b.rejectedAt || b.submittedAt);
        return dateB - dateA;
      });
    return submissions;
  },

  /**
   * Create a new game submission (requires admin approval)
   */
  async createGame(gameData, operatorId, userProfile) {
    // Security: Enforce competition and region from user profile
    if (!userProfile.verifiedOperator) {
      throw new Error('User is not a verified operator');
    }

    if (!userProfile.region) {
      throw new Error('User does not have a verified region');
    }

    const submission = {
      ...gameData,
      // Override these fields to prevent tampering
      competition: userProfile.verifiedOperator, // Use verified competition
      region: userProfile.region, // Use verified region
      operatorId,
      operatorName: userProfile.displayName || 'Unknown',
      operatorEmail: userProfile.email || '',
      submissionType: 'create',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create submission for admin approval
    const docRef = await addDoc(collection(db, 'gameSubmissions'), submission);
    return { id: docRef.id, ...submission };
  },

  /**
   * Update an existing game (requires admin approval)
   */
  async updateGame(gameId, updates, operatorId, userProfile) {
    // Security: Remove competition and region from updates to prevent tampering
    const { competition, region, operatorId: _, ...safeUpdates } = updates;

    const submission = {
      ...safeUpdates,
      competition: userProfile.verifiedOperator,
      region: userProfile.region,
      operatorId,
      operatorName: userProfile.displayName || 'Unknown',
      operatorEmail: userProfile.email || '',
      gameId, // Reference to the game being updated
      submissionType: 'edit',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create submission for admin approval
    const docRef = await addDoc(collection(db, 'gameSubmissions'), submission);
    return { id: docRef.id, ...submission };
  },

  /**
   * Request to delete a game (requires admin approval)
   */
  async deleteGame(gameId, operatorId, userProfile, gameData) {
    const submission = {
      ...gameData, // Include game data for context
      gameId,
      operatorId,
      operatorName: userProfile.displayName || 'Unknown',
      operatorEmail: userProfile.email || '',
      submissionType: 'delete',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create submission for admin approval
    const docRef = await addDoc(collection(db, 'gameSubmissions'), submission);
    return { id: docRef.id, ...submission };
  },

  /**
   * Promote a game (paid feature)
   */
  async promoteGame(gameId, operatorId, duration = 7) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    const collectionName = USE_FIRESTORE ? 'games' : 'operatorGames';
    const gameRef = doc(db, collectionName, gameId);

    await updateDoc(gameRef, {
      isPromoted: true,
      promotionExpiresAt: expiresAt.toISOString(),
      updatedAt: new Date().toISOString(),
      lastModifiedBy: operatorId,
    });

    // Create promotion record
    await addDoc(collection(db, 'promotions'), {
      gameId,
      operatorId,
      startDate: new Date().toISOString(),
      endDate: expiresAt.toISOString(),
      duration,
      status: 'active',
      createdAt: new Date().toISOString(),
    });
  },

  /**
   * Create a game announcement
   */
  async createAnnouncement(gameId, operatorId, message, type = 'info', expiresInHours = 6) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const announcement = {
      gameId,
      operatorId,
      message,
      type, // delay, cancellation, info, update
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      isActive: true,
    };

    const docRef = await addDoc(collection(db, 'gameAnnouncements'), announcement);
    return { id: docRef.id, ...announcement };
  },

  /**
   * Get announcements for a game
   */
  async getGameAnnouncements(gameId) {
    const q = query(
      collection(db, 'gameAnnouncements'),
      where('gameId', '==', gameId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    const announcements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter out expired announcements
    const now = new Date();
    return announcements.filter(ann => new Date(ann.expiresAt) > now);
  },

  // Private helper methods
  async _getGamesFromJSON(region) {
    const dataFile = REGION_CONFIG[region];
    if (!dataFile) {
      throw new Error(`No data file configured for region: ${region}`);
    }

    const response = await fetch(dataFile);
    const games = await response.json();

    // Add IDs to JSON games for consistency
    return games.map((game, index) => ({
      id: `json-${region}-${index}`,
      ...game,
      source: 'json',
    }));
  },

  async _getGamesFromFirestore(region) {
    const q = query(
      collection(db, 'games'),
      where('region', '==', region),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      source: 'firestore',
    }));
  },

  /**
   * Get combined games (JSON + operator-created Firestore games)
   * This allows gradual migration
   */
  async getCombinedGames(region) {
    const jsonGames = await this._getGamesFromJSON(region);

    // Get operator-created games from Firestore
    const q = query(
      collection(db, 'operatorGames'),
      where('region', '==', region),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    const operatorGames = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      source: 'operator',
    }));

    // Combine and sort by day/time
    return [...jsonGames, ...operatorGames].sort((a, b) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.game_time.localeCompare(b.game_time);
    });
  },
};
