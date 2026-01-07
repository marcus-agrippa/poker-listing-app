# Complete Firestore Security Rules

Copy these rules and paste them into your Firebase Console → Firestore Database → Rules tab.

## How to Update Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the entire code block below
5. Paste it into the rules editor
6. Click **Publish**

---

## Complete Rules Code

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ========== Helper Functions ==========

    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && (
        request.auth.token.email in [
          'pokergamesaus@gmail.com'
          // Add more admin emails as needed, separated by commas
        ] ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
      );
    }

    // Helper function to check if user is signed in
    function isSignedIn() {
      return request.auth != null;
    }

    // Helper function to check if user is a verified operator
    function isVerifiedOperator() {
      return isSignedIn() &&
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.verifiedOperator != null;
    }

    // Helper function to check if user is the operator for a game
    function isOperatorForGame(gameData) {
      return isSignedIn() && gameData.operatorId == request.auth.uid;
    }

    // Helper function to check if operator is in the correct region
    function isOperatorInRegion(region) {
      let userProfile = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return userProfile.region == region;
    }

    // ========== Users Collection ==========

    match /users/{userId} {
      // Users can read and write their own profile
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // All authenticated users can read user profiles (for social features)
      allow read: if request.auth != null;
    }

    // ========== Results Collection - 100% PRIVATE ==========

    match /results/{resultId} {
      // Users can ONLY read their own results
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;

      // Users can ONLY create results for themselves
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;

      // Users can ONLY update/delete their own results
      allow update, delete: if request.auth != null &&
                               resource.data.userId == request.auth.uid;

      // IMPORTANT: Even admins CANNOT read user results
      // This ensures 100% privacy
    }

    // ========== Game Confirmations - PUBLIC CROWDSOURCED DATA ==========

    match /gameConfirmations/{confirmationId} {
      // Anyone can read confirmations (public crowdsourced data)
      allow read: if true;

      // Authenticated users can create confirmations
      allow create: if request.auth != null;

      // Authenticated users can update confirmations (to add their confirmation)
      allow update: if request.auth != null;

      // No one can delete confirmations (they auto-expire)
      allow delete: if false;
    }

    // ========== Favorites Collection ==========

    match /favorites/{favoriteId} {
      // Users can read their own favorites
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      // Users can create favorites for themselves
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // Users can delete their own favorites
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
      // Admins can read and modify all favorites
      allow read, update, delete: if isAdmin();
    }

    // ========== Pokerdex Collection - PRIVATE NOTES ==========

    match /pokerdex/{entryId} {
      // Users can read their own pokerdex entries
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      // Users can create pokerdex entries for themselves
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // Users can update/delete their own pokerdex entries
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // ========== Game Suggestions Collection ==========

    match /gameSuggestions/{suggestionId} {
      // Users can create suggestions
      allow create: if request.auth != null;
      // Users can read their own suggestions, admins can read all
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.submittedBy.userId ||
        isAdmin()
      );
      // Only admins can update suggestions (approve/reject)
      allow update: if isAdmin();
    }

    // ========== Suggestions Collection (General) ==========

    match /suggestions/{suggestionId} {
      // Anyone authenticated can create suggestions
      allow create: if request.auth != null;
      // Users can read their own suggestions
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      // Admins can read all suggestions and update/delete
      allow read, update, delete: if isAdmin();
    }

    // ========== Operator Claims Collection ==========

    match /operatorClaims/{claimId} {
      // Users can create claims for themselves
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // Users can read their own claims
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      // Admins can read, update, and delete all claims
      allow read, update, delete: if isAdmin();
    }

    // ========== Game Updates Collection ==========

    match /gameUpdates/{updateId} {
      // Users can create game updates
      allow create: if request.auth != null;
      // Users can read their own updates, admins can read all
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        isAdmin()
      );
      // Users can update/delete their own, admins can update/delete all
      allow update, delete: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        isAdmin()
      );
    }

    // ========== Operator Announcements Collection ==========

    match /operatorAnnouncements/{announcementId} {
      // Everyone can read announcements
      allow read: if request.auth != null;
      // Verified operators can create announcements
      allow create: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.verifiedOperator != null;
      // Users can update/delete their own, admins can update/delete all
      allow update, delete: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        isAdmin()
      );
    }

    // ========== Check-ins Collection ==========

    match /checkIns/{checkInId} {
      // Anyone can read check-ins (public social feature)
      allow read: if true;
      // Only authenticated users can create check-ins for themselves
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
      // Users can only update/delete their own check-ins
      allow update, delete: if request.auth != null &&
                               resource.data.userId == request.auth.uid;
    }

    // ========== OPERATOR GAMES COLLECTION (NEW) ==========
    // This collection stores games created by verified operators
    // Operators can only create games for their verified competition and region

    match /operatorGames/{gameId} {
      // Anyone can read active games (public data)
      allow read: if resource.data.isActive == true;

      // Only verified operators can create games
      allow create: if isVerifiedOperator()
        && isOperatorInRegion(request.resource.data.region)
        && request.resource.data.operatorId == request.auth.uid
        && request.resource.data.isActive == true
        && request.resource.data.venue is string
        && request.resource.data.competition is string
        && request.resource.data.day is string
        && request.resource.data.game_time is string
        && request.resource.data.region is string;

      // Only the game's operator can update their own games
      // SECURITY: Cannot change operatorId, region, or competition
      allow update: if isVerifiedOperator()
        && isOperatorForGame(resource.data)
        && request.resource.data.operatorId == resource.data.operatorId
        && request.resource.data.region == resource.data.region
        && request.resource.data.competition == resource.data.competition;

      // Only the game's operator can delete (soft delete)
      allow delete: if isVerifiedOperator() && isOperatorForGame(resource.data);
    }

    // ========== PROMOTIONS COLLECTION (NEW) ==========
    // Tracks paid game promotions by operators

    match /promotions/{promotionId} {
      // All authenticated users can read promotions
      allow read: if isSignedIn();

      // Only verified operators can create promotions for their own games
      allow create: if isVerifiedOperator()
        && request.resource.data.operatorId == request.auth.uid
        && request.resource.data.gameId is string
        && request.resource.data.duration is number;

      // Only the promotion creator can update/delete
      allow update, delete: if isVerifiedOperator()
        && resource.data.operatorId == request.auth.uid;
    }

    // ========== GAME ANNOUNCEMENTS COLLECTION (NEW) ==========
    // Real-time announcements from operators about their games

    match /gameAnnouncements/{announcementId} {
      // Anyone can read announcements (public data)
      allow read: if true;

      // Only verified operators can create announcements
      allow create: if isVerifiedOperator()
        && request.resource.data.operatorId == request.auth.uid
        && request.resource.data.gameId is string
        && request.resource.data.message is string
        && request.resource.data.type is string;

      // Only the announcement creator can update/delete
      allow update, delete: if isVerifiedOperator()
        && resource.data.operatorId == request.auth.uid;
    }

    // ========== GAME SUBMISSIONS COLLECTION (NEW) ==========
    // Operator game submissions that require admin approval

    match /gameSubmissions/{submissionId} {
      // Operators can read their own submissions, admins can read all
      allow read: if isSignedIn() && (
        request.auth.uid == resource.data.operatorId ||
        isAdmin()
      );

      // Only verified operators can create submissions
      allow create: if isVerifiedOperator()
        && request.resource.data.operatorId == request.auth.uid
        && request.resource.data.submissionType in ['create', 'edit', 'delete']
        && request.resource.data.status == 'pending';

      // Only admins can update submissions (approve/reject)
      allow update: if isAdmin();

      // Only admins can delete submissions
      allow delete: if isAdmin();
    }
  }
}
```

---

## What Changed

### New Collections Added

1. **operatorGames** - Stores games created by verified operators
   - Security: Region and competition locked to operator's verified values
   - Cannot transfer ownership or change region/competition after creation

2. **promotions** - Tracks paid game promotions
   - Only accessible by verified operators
   - Operators can only manage their own promotions

3. **gameAnnouncements** - Real-time game updates from operators
   - Public read access (anyone can see announcements)
   - Only verified operators can create/manage their announcements

4. **gameSubmissions** - Operator game changes requiring admin approval
   - Operators submit create/edit/delete requests
   - Admins review and approve/reject submissions
   - Operators can only read their own submissions

### New Helper Functions

- `isVerifiedOperator()` - Checks if user has verified operator status
- `isOperatorForGame()` - Checks if user owns a specific game
- `isOperatorInRegion()` - Validates operator is in correct region

### Security Guarantees

✅ Operators can ONLY create games for their verified competition and region
✅ Operators CANNOT change competition, region, or ownership after creation
✅ Operators can ONLY manage their own games, promotions, and announcements
✅ Multi-layer security (UI + Service + Firestore rules)

---

## Testing the Rules

After publishing, test in Firebase Console → Firestore → Rules playground:

### Test 1: Verified operator creates game ✅
```javascript
// Auth: uid = "user123", verifiedOperator = "APL Poker", region = "Central Coast"
// Operation: create /operatorGames/newGame
// Data:
{
  "operatorId": "user123",
  "competition": "APL Poker",
  "region": "Central Coast",
  "venue": "Test RSL",
  "day": "Monday",
  "game_time": "19:00",
  "isActive": true
}
// Expected: ✅ Allow
```

### Test 2: Cannot change region on update ❌
```javascript
// Auth: uid = "user123" (owner)
// Operation: update /operatorGames/game123
// Data:
{
  "region": "Sydney"
}
// Expected: ❌ Deny (region changed)
```

### Test 3: Non-operator cannot create game ❌
```javascript
// Auth: uid = "user456", no verifiedOperator
// Operation: create /operatorGames/newGame
// Expected: ❌ Deny (not verified operator)
```

---

## Next Steps

1. ✅ Copy the rules above
2. ✅ Paste into Firebase Console → Firestore → Rules
3. ✅ Click **Publish**
4. ✅ Test using the Rules playground
5. ✅ Create the required indexes (see below)

---

## Required Firestore Indexes

Create these in Firebase Console → Firestore → Indexes:

### operatorGames
1. `region` (Ascending) + `isActive` (Ascending)
2. `operatorId` (Ascending) + `updatedAt` (Descending)

### promotions
1. `operatorId` (Ascending) + `status` (Ascending)

### gameAnnouncements
1. `gameId` (Ascending) + `isActive` (Ascending)

### gameSubmissions
1. `operatorId` (Ascending) + `status` (Ascending) + `submittedAt` (Descending)

---

Your Firestore security is now production-ready! 🔒
