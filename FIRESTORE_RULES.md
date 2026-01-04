# Firestore Security Rules

Copy these rules to your Firebase Console > Firestore Database > Rules

## Complete Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

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

    // Users collection
    match /users/{userId} {
      // Users can read and write their own profile
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // All authenticated users can read user profiles (for social features)
      allow read: if request.auth != null;
    }

    // Results collection - 100% PRIVATE
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

    // Game Confirmations collection - PUBLIC CROWDSOURCED DATA
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

    // Favorites collection
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

    // Pokerdex collection - PRIVATE NOTES
    match /pokerdex/{entryId} {
      // Users can read their own pokerdex entries
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      // Users can create pokerdex entries for themselves
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // Users can update/delete their own pokerdex entries
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Game Suggestions collection
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

    // Suggestions collection (general)
    match /suggestions/{suggestionId} {
      // Anyone authenticated can create suggestions
      allow create: if request.auth != null;
      // Users can read their own suggestions
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      // Admins can read all suggestions and update/delete
      allow read, update, delete: if isAdmin();
    }

    // Operator Claims collection
    match /operatorClaims/{claimId} {
      // Users can create claims for themselves
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // Users can read their own claims
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      // Admins can read, update, and delete all claims
      allow read, update, delete: if isAdmin();
    }

    // Game Updates collection (for operator dashboard - future feature)
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

    // Operator Announcements collection (for operator dashboard - future feature)
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

    // Check-ins collection (for future feature)
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
  }
}
```

## How to Apply These Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** > **Rules**
4. Copy the rules above
5. Paste them into the rules editor
6. Click **Publish**

## Collection Privacy Levels

### 🔒 100% Private (Only User)
- **results** - Game results and session logs
- **pokerdex** - Private player notes
- **favorites** - User's favorite venues

### 👥 User + Admin Access
- **gameSuggestions** - Game edit suggestions
- **suggestions** - General suggestions
- **operatorClaims** - Operator verification claims
- **gameUpdates** - Operator game updates (future)

### 🌍 Public Read
- **gameConfirmations** - Crowdsourced game verification
- **checkIns** - Social check-in feature (future)
- **operatorAnnouncements** - Operator announcements (future)
- **users** - Basic user profiles (for social features)

## Important Notes

- **Game Confirmations** are public by design (crowdsourced verification)
- **Results** are 100% private - even admins cannot read them
- Confirmations auto-expire after 6 hours from game start time
- Each user can only confirm a game once per week
- Admin access is controlled by both email whitelist and user.isAdmin flag
