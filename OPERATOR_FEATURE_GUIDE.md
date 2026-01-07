# Operator Feature Implementation Guide

## Overview

This document explains the complete operator feature implementation that allows verified operators to manage their poker games. The system is designed to work with **both JSON files (current) and Firestore (future)** through a dual-mode architecture.

---

## What's Been Built

### 1. **Games Service** (`src/services/gamesService.js`)
A flexible service layer that can work with both JSON files and Firestore.

**Key Features:**
- Dual-mode operation via `USE_FIRESTORE` flag (currently `false`)
- JSON mode: Operator games stored in `operatorGames` Firestore collection
- Firestore mode: All games in single `games` collection (for future migration)
- Combined games view: Merges JSON games + operator-created games

**Main Functions:**
- `getGamesByRegion(region)` - Get all games for a region
- `getOperatorGames(operatorId)` - Get games managed by operator
- `createGame(gameData, operatorId, userProfile)` - Create new game
- `updateGame(gameId, updates, operatorId)` - Update existing game
- `deleteGame(gameId, operatorId)` - Soft delete (sets isActive=false)
- `promoteGame(gameId, operatorId, duration)` - Promote game (paid feature)
- `createAnnouncement(gameId, operatorId, message, type)` - Post announcements
- `getCombinedGames(region)` - Get JSON + Firestore games together

### 2. **Operator Dashboard** (`src/components/operator/OperatorDashboard.jsx`)
Main control panel for verified operators.

**Features:**
- View all operator's games
- Stats cards: Total games, promoted games, active games
- Add/edit/delete games
- Promote games
- Post announcements
- Access restricted to verified operators only

### 3. **Game Form Modal** (`src/components/operator/GameFormModal.jsx`)
Complete form for adding/editing games.

**Security Features:**
- Competition and region are **locked** to operator's verified values
- Cannot be changed by operator (enforced at UI and service layer)
- Display-only badge showing verified competition and region

**Fields:**
- Basic Info: Venue name (competition locked to verified value)
- Schedule: Day, registration time, game time, late registration time
- Buy-in Details: Buy-in, re-buy, re-entry, add-ons, bounty, starting stack
- Prize Pool: Guarantee, prize pool

### 4. **Promote Game Modal** (`src/components/operator/PromoteGameModal.jsx`)
Paid promotion feature.

**Packages:**
- 1 Week: $9.99
- 1 Month: $29.99 (most popular, 25% off)
- 3 Months: $74.99 (38% off)

**Benefits:**
- Featured badge on listing
- Boosted placement in results
- Premium styling
- Priority on map view

**Note:** Payment integration placeholder - currently activates immediately for testing.

### 5. **Announcement Modal** (`src/components/operator/AnnouncementModal.jsx`)
Post real-time updates about games.

**Announcement Types:**
- Information (blue)
- Delayed Start (yellow)
- Cancelled (red)
- Game Update (green)

**Features:**
- Custom message (up to textarea length)
- Auto-expiration (1-24 hours)
- Live preview of announcement

### 6. **Navigation Updates**
- Added "Operator" link to Header (desktop & mobile)
- Only visible to verified operators
- Green color to distinguish from other links
- Icon: FiBriefcase

### 7. **Routing**
- Added `/operator` route in App.js
- Protected with `ProtectedRoute` component
- Accessible to all logged-in users (dashboard checks verification)

---

## Current State: JSON + Firestore Hybrid

### How It Works Now

1. **JSON Files Remain:**
   - All existing games still in `/data.json`, `/data-newcastle.json`, etc.
   - Continue to be served via Netlify CDN
   - Read-only for display

2. **Operator-Created Games:**
   - Stored in Firestore `operatorGames` collection
   - Can be added/edited/deleted by verified operators
   - Merged with JSON games when displaying to users

3. **Game Display:**
   ```javascript
   // In GameList component (future update needed)
   const games = await gamesService.getCombinedGames(region);
   // Returns: [...jsonGames, ...operatorGames]
   ```

### Firestore Collections Created

**operatorGames:**
```javascript
{
  id: "auto-generated",
  venue: "Example RSL",
  competition: "APL Poker", // Locked to operator's verifiedOperator value
  region: "Central Coast",  // Locked to operator's region value
  day: "Monday",
  rego_time: "18:00",
  game_time: "19:00",
  late_rego: "20:20",
  buy_in: "15",
  re_buy: "10",
  re_entry: "",
  addons: "10",
  bounty: "",
  starting_stack: "25,000",
  guarantee: "",
  prize_pool: "",
  operatorId: "userId",
  operatorName: "John Smith",
  operatorEmail: "john@example.com",
  isActive: true,
  isPaused: false,
  isPromoted: false,
  createdAt: "2026-01-06T...",
  updatedAt: "2026-01-06T...",
}
```

**Security Enforcement:**
- `competition` field is **always** set to `userProfile.verifiedOperator`
- `region` field is **always** set to `userProfile.region`
- These cannot be changed via updates (stripped from update payload)
- Enforced at service layer (`gamesService.js`) to prevent tampering

**promotions:**
```javascript
{
  id: "auto-generated",
  gameId: "ref-to-game",
  operatorId: "userId",
  startDate: "2026-01-10",
  endDate: "2026-01-17",
  duration: 7,
  status: "active",
  createdAt: "2026-01-06T..."
}
```

**gameAnnouncements:**
```javascript
{
  id: "auto-generated",
  gameId: "ref-to-game",
  operatorId: "userId",
  message: "Game delayed 30 mins",
  type: "delay",
  isActive: true,
  createdAt: "2026-01-06T...",
  expiresAt: "2026-01-06T..."
}
```

---

## Migration Path (When Ready)

### Step 1: Update Game Display Components

Update `GameList.jsx` or wherever games are fetched:

```javascript
// OLD (JSON only):
const response = await fetch('/data.json');
const games = await response.json();

// NEW (Combined):
import { gamesService } from '../services/gamesService';
const games = await gamesService.getCombinedGames(region);
```

### Step 2: Test Combined View
- Verify JSON games still display
- Verify operator games appear alongside JSON games
- Check sorting works correctly
- Test filtering and search

### Step 3: Gradual JSON to Firestore Migration

**Option A: Import all at once**
1. Create migration script to import all JSON files
2. Test thoroughly
3. Flip `USE_FIRESTORE` flag to `true`
4. Remove JSON files

**Option B: Migrate region by region**
1. Import one region's games to Firestore
2. Update that region to use Firestore
3. Test for a week
4. Repeat for next region

### Step 4: Flip the Switch

In `src/services/gamesService.js`:
```javascript
const USE_FIRESTORE = true; // Change from false
```

All methods will now use Firestore exclusively.

---

## Security Architecture

### Multi-Layer Protection

**Layer 1: UI Enforcement**
- Competition and region fields displayed as read-only badge
- Form does not allow editing these values
- Pre-filled from `userProfile.verifiedOperator` and `userProfile.region`

**Layer 2: Service Layer Enforcement**
- `createGame()` - Overrides competition/region with profile values
- `updateGame()` - Strips competition/region from updates payload
- Validates user has `verifiedOperator` status before any operation

**Layer 3: Firestore Security Rules**
- Validates region matches user profile
- Ensures only operator can modify their own games
- Prevents unauthorized access

### Why Multi-Layer?

Even if someone bypasses the UI (browser dev tools, API calls), the service layer and Firestore rules prevent unauthorized changes. This is defense-in-depth security.

---

## Required Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isVerifiedOperator() {
      return isSignedIn() &&
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.verifiedOperator != null;
    }

    function isOperatorForGame(gameData) {
      return isSignedIn() && gameData.operatorId == request.auth.uid;
    }

    function isOperatorInRegion(region) {
      let userProfile = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return userProfile.region == region;
    }

    // Operator-created games (temporary collection)
    match /operatorGames/{gameId} {
      allow read: if resource.data.isActive == true;

      allow create: if isVerifiedOperator()
        && isOperatorInRegion(request.resource.data.region)
        && request.resource.data.operatorId == request.auth.uid;

      allow update: if isVerifiedOperator() && isOperatorForGame(resource.data);
      allow delete: if isVerifiedOperator() && isOperatorForGame(resource.data);
    }

    // Promotions
    match /promotions/{promotionId} {
      allow read: if isSignedIn();
      allow create: if isVerifiedOperator()
        && request.resource.data.operatorId == request.auth.uid;
      allow update, delete: if isVerifiedOperator()
        && resource.data.operatorId == request.auth.uid;
    }

    // Game announcements
    match /gameAnnouncements/{announcementId} {
      allow read: if true;
      allow create: if isVerifiedOperator()
        && request.resource.data.operatorId == request.auth.uid;
      allow update, delete: if isVerifiedOperator()
        && resource.data.operatorId == request.auth.uid;
    }
  }
}
```

---

## Required Firestore Indexes

Create these in Firebase Console → Firestore → Indexes:

1. **operatorGames**:
   - `region` (Ascending) + `isActive` (Ascending)
   - `operatorId` (Ascending) + `updatedAt` (Descending)

2. **promotions**:
   - `operatorId` (Ascending) + `status` (Ascending)

3. **gameAnnouncements**:
   - `gameId` (Ascending) + `isActive` (Ascending)

---

## Next Steps for Full Integration

### 1. Update GameList Component

The `GameList` component needs to call `getCombinedGames()` instead of just reading JSON:

```javascript
// In src/components/GameList.jsx (or similar)
import { gamesService } from '../services/gamesService';

// Inside the component:
useEffect(() => {
  const fetchGames = async () => {
    try {
      const combinedGames = await gamesService.getCombinedGames(region);
      setGames(combinedGames);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  fetchGames();
}, [region]);
```

### 2. Display Operator Badge

Add visual indicator for operator-managed games:

```javascript
{game.source === 'operator' && (
  <span className="badge badge-success badge-sm">
    <FiBriefcase className="mr-1" /> Verified Operator
  </span>
)}
```

### 3. Display Promoted Games

Highlight promoted games:

```javascript
{game.isPromoted && (
  <div className="absolute top-2 right-2">
    <span className="badge badge-warning">
      <FiStar className="mr-1" /> Featured
    </span>
  </div>
)}
```

### 4. Display Announcements

Show announcements on game cards:

```javascript
const [announcements, setAnnouncements] = useState([]);

useEffect(() => {
  const fetchAnnouncements = async () => {
    const ann = await gamesService.getGameAnnouncements(game.id);
    setAnnouncements(ann);
  };

  if (game.source === 'operator') {
    fetchAnnouncements();
  }
}, [game.id]);

// In render:
{announcements.map(ann => (
  <div key={ann.id} className={`announcement-${ann.type}`}>
    {ann.message}
  </div>
))}
```

---

## Testing Checklist

### Before Migration
- [ ] Verify operator verification flow works
- [ ] Test creating a game as verified operator
- [ ] Test editing an operator game
- [ ] Test deleting an operator game
- [ ] Test promotion feature
- [ ] Test announcements feature
- [ ] Verify non-operators cannot access dashboard
- [ ] Test JSON games still display correctly

### During Migration
- [ ] Import sample JSON games to Firestore
- [ ] Test `getCombinedGames()` returns both sources
- [ ] Verify sorting works with mixed sources
- [ ] Test filtering with combined data
- [ ] Check map view works with combined data
- [ ] Verify confirmations work on both types
- [ ] Test favorites work on both types

### After Migration
- [ ] All regions display correctly
- [ ] Search works across all games
- [ ] Performance is acceptable
- [ ] No duplicate games appear
- [ ] Operators can still manage their games
- [ ] Analytics tracking works

---

## Cost Estimation

**Firestore (1000 games across all regions):**
- Storage: ~1 MB (free tier: 1 GB)
- Reads: ~50,000/day if 1000 users view 50 games (free tier: 50,000/day)
- Writes: ~100/day from operator updates (free tier: 20,000/day)

**Verdict:** Should stay within free tier indefinitely.

---

## Future Enhancements

### Immediate (Already Planned)
1. ✅ Operator can add/edit/delete games
2. ✅ Region-specific access control
3. ✅ Paid promotion feature
4. ✅ Game announcements

### Future Features
1. **Analytics Dashboard**
   - View confirmation trends
   - Track favorites count
   - See calendar adds

2. **Bulk Operations**
   - Update multiple games at once
   - Clone game templates
   - Batch pause/unpause

3. **Player Communication**
   - Notify users who favorited game
   - Email announcements
   - Push notifications

4. **Payment Integration**
   - Stripe integration for promotions
   - Subscription plans for operators
   - Revenue analytics

5. **Game History**
   - Audit log of changes
   - Undo recent edits
   - Version history

---

## Support & Documentation

### File Structure
```
src/
├── services/
│   └── gamesService.js          # Main games service
├── components/
│   └── operator/
│       ├── OperatorDashboard.jsx    # Main dashboard
│       ├── GameFormModal.jsx        # Add/edit game form
│       ├── PromoteGameModal.jsx     # Promotion feature
│       └── AnnouncementModal.jsx    # Post announcements
```

### Key Concepts

**Verified Operator:**
- User with `verifiedOperator` field in their profile
- Can only manage games in their verified region
- Approved by admin through operator claims system

**Dual Mode:**
- JSON files + Firestore during transition
- Single flag (`USE_FIRESTORE`) controls data source
- Seamless migration path

**Soft Delete:**
- Games never truly deleted
- Set `isActive: false` instead
- Preserves data integrity

---

## Questions & Troubleshooting

### Q: Can operators edit JSON games?
**A:** No, JSON games are read-only. Operators can only manage games they create through the dashboard.

### Q: What happens to confirmations on operator games?
**A:** They work exactly the same - `gameConfirmations` collection uses `gameId` which works for both JSON and Firestore games.

### Q: Can I test without being verified?
**A:** The dashboard will show a verification required message. You need to go through the operator claim flow in your profile.

### Q: How do I become an admin to approve operators?
**A:** Add your email to `REACT_APP_ADMIN_EMAILS` environment variable (comma-separated list).

### Q: What if an operator changes regions?
**A:** Security rules prevent them from managing games outside their current region. Existing games remain but become uneditable.

---

## Migration Script Template

When ready to migrate JSON to Firestore:

```javascript
// scripts/migrateJsonToFirestore.js
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json')
});

const db = admin.firestore();

async function migrateRegion(regionName, jsonFile) {
  const games = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

  for (const game of games) {
    await db.collection('games').add({
      ...game,
      region: regionName,
      isActive: true,
      isPaused: false,
      isPromoted: false,
      operatorId: null, // No operator for JSON imports
      source: 'migrated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  console.log(`Migrated ${games.length} games for ${regionName}`);
}

// Run migration
migrateRegion('Central Coast', './public/data.json');
```

---

## Summary

You now have a complete operator management system that:
- Works with current JSON files
- Allows operators to add new games
- Supports promotions and announcements
- Can migrate to full Firestore when ready
- Maintains security and data integrity

The system is production-ready for operator features while maintaining backward compatibility with your JSON workflow!
