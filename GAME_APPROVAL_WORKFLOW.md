# Game Approval Workflow

## Overview

All operator game changes (create, edit, delete) now require admin approval before going live. This ensures quality control and prevents abuse of the operator system.

---

## How It Works

### For Operators

1. **Submit a Game Change**
   - Navigate to Operator Dashboard
   - Add new game, edit existing game, or delete a game
   - Fill in the form and submit
   - Submission is created with `status: 'pending'`

2. **Await Approval**
   - Toast notification confirms submission
   - Game changes are NOT immediately visible to users
   - Operators can track their submission status in the dashboard

3. **After Admin Review**
   - If **approved**: Changes go live immediately
   - If **rejected**: Operator is notified, no changes made

### For Admins

1. **Review Submissions**
   - Navigate to `/admin/game-submissions`
   - View all pending game submissions
   - See operator details, game information, and submission type

2. **Approve or Reject**
   - **Approve**: Creates/updates/deletes game in `operatorGames` collection
   - **Reject**: Marks submission as rejected, no action taken
   - **Delete**: Removes the submission from the queue

---

## Submission Types

### Create (`submissionType: 'create'`)
- Operator wants to add a new game
- Approval creates game in `operatorGames` collection
- Game becomes visible to all users

### Edit (`submissionType: 'edit'`)
- Operator wants to modify existing game
- Includes `gameId` reference to the game being updated
- Approval updates the game in `operatorGames` collection

### Delete (`submissionType: 'delete'`)
- Operator wants to remove a game
- Includes `gameId` and full game data for context
- Approval soft-deletes game (sets `isActive: false`)

---

## Firestore Collections

### gameSubmissions

```javascript
{
  id: "auto-generated",

  // Game Data
  venue: "Gosford RSL Club",
  competition: "APL Poker",
  region: "Central Coast",
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

  // Operator Info
  operatorId: "userId",
  operatorName: "John Smith",
  operatorEmail: "john@example.com",

  // Submission Metadata
  submissionType: "create", // or "edit" or "delete"
  status: "pending", // or "approved" or "rejected"
  gameId: "ref-to-game-if-edit-or-delete", // only for edit/delete

  // Timestamps
  submittedAt: "2026-01-06T...",
  approvedAt: "2026-01-06T...", // when approved
  rejectedAt: "2026-01-06T...", // when rejected
  updatedAt: "2026-01-06T...",
}
```

---

## Admin Interface

### Game Submissions View (`/admin/game-submissions`)

**Stats Cards:**
- Pending submissions count
- Approved submissions count
- Rejected submissions count

**Pending Reviews Section:**
- Shows all submissions with `status: 'pending'`
- Displays game details, operator info, submission type
- Action buttons:
  - ✅ **Approve** - Apply the changes
  - ❌ **Reject** - Deny the request
  - 🗑️ **Delete** - Remove submission

**Processed Submissions Section:**
- Table of all approved/rejected submissions
- Filterable history for reference

---

## Security

### Multi-Layer Protection

**Layer 1: Service Layer**
- `createGame()`, `updateGame()`, `deleteGame()` create submissions instead of direct changes
- Enforces `submissionType` and `status: 'pending'`
- Prevents operators from bypassing approval

**Layer 2: Firestore Rules**
```javascript
match /gameSubmissions/{submissionId} {
  // Operators can only read their own submissions
  allow read: if request.auth.uid == resource.data.operatorId || isAdmin();

  // Only verified operators can create submissions
  allow create: if isVerifiedOperator()
    && request.resource.data.operatorId == request.auth.uid
    && request.resource.data.status == 'pending';

  // Only admins can approve/reject (update)
  allow update: if isAdmin();

  // Only admins can delete
  allow delete: if isAdmin();
}
```

**Layer 3: Admin-Only Approval**
- Only users in `REACT_APP_ADMIN_EMAILS` can access `/admin/game-submissions`
- Protected by `AdminRoute` component

---

## User Experience

### Operator Flow

1. **Add New Game**
   ```
   Operator Dashboard → Add New Game → Fill Form → Submit
   ↓
   Toast: "Game submitted for admin approval!"
   ↓
   Game pending in admin queue
   ```

2. **Edit Existing Game**
   ```
   Operator Dashboard → Edit Game → Modify Fields → Submit
   ↓
   Toast: "Update submitted for admin approval!"
   ↓
   Update pending in admin queue (original game unchanged)
   ```

3. **Delete Game**
   ```
   Operator Dashboard → Delete Game → Confirm
   ↓
   Toast: "Delete request submitted for admin approval"
   ↓
   Delete pending in admin queue (game still visible)
   ```

### Admin Flow

1. **Approve Create**
   ```
   Admin Portal → Game Submissions → View Pending → Approve
   ↓
   New game added to operatorGames collection
   ↓
   Visible to all users immediately
   ```

2. **Approve Edit**
   ```
   Admin Portal → Game Submissions → View Pending → Approve
   ↓
   Existing game updated in operatorGames collection
   ↓
   Changes visible to all users immediately
   ```

3. **Approve Delete**
   ```
   Admin Portal → Game Submissions → View Pending → Approve
   ↓
   Game soft-deleted (isActive: false)
   ↓
   Game removed from public listings
   ```

4. **Reject Any Submission**
   ```
   Admin Portal → Game Submissions → View Pending → Reject
   ↓
   Submission marked as rejected
   ↓
   No changes applied, operator can see rejection status
   ```

---

## Benefits

### Quality Control
- Prevents spam or fake game listings
- Ensures accurate information
- Maintains platform integrity

### Abuse Prevention
- Operators cannot flood platform with games
- Changes reviewed before going live
- Easy to revert bad actors

### Compliance
- Central point for moderation
- Audit trail of all changes
- Clear accountability

---

## Future Enhancements

### Operator Dashboard Improvements
1. **Show Pending Submissions**
   - Add tab to operator dashboard
   - Display submission status
   - Allow operators to cancel pending submissions

2. **Submission History**
   - View past approvals/rejections
   - Learn from rejected submissions
   - Track submission trends

### Admin Dashboard Improvements
1. **Bulk Actions**
   - Approve/reject multiple submissions at once
   - Filter by operator, region, or date
   - Export submission data

2. **Notifications**
   - Email admins when new submissions arrive
   - Send notifications to operators on approval/rejection
   - Slack/Discord integration for admin alerts

3. **Auto-Approval Rules**
   - Trusted operators (after N approved submissions)
   - Minor edits (changing time by <1 hour)
   - Configurable auto-approval criteria

---

## Migration from Direct Creation

### Old Behavior
```javascript
// Operators could directly create games
await gamesService.createGame(gameData, operatorId, userProfile);
// ↓ Game immediately visible to users
```

### New Behavior
```javascript
// Operators create submissions
await gamesService.createGame(gameData, operatorId, userProfile);
// ↓ Submission created with status: 'pending'
// ↓ Admin reviews and approves
// ↓ THEN game becomes visible to users
```

---

## Testing Checklist

### As Operator
- [ ] Submit new game - should show "submitted for approval"
- [ ] Edit existing game - should create edit submission
- [ ] Delete game - should create delete submission
- [ ] Games should NOT appear immediately after submission
- [ ] Toast messages indicate pending approval

### As Admin
- [ ] View pending submissions in admin panel
- [ ] Approve create submission - game appears in listings
- [ ] Approve edit submission - game updates
- [ ] Approve delete submission - game disappears
- [ ] Reject submission - no changes applied
- [ ] Delete submission - removes from queue

### Security Tests
- [ ] Non-admin cannot access `/admin/game-submissions`
- [ ] Operator cannot approve their own submissions
- [ ] Operator cannot bypass approval workflow
- [ ] Firestore rules prevent direct game creation

---

## Summary

The approval workflow adds a critical layer of moderation to the operator system. While it adds one extra step (admin approval), it ensures platform quality and prevents abuse. The system is designed to be fast and efficient for admins while keeping operators informed of their submission status.

**Key Points:**
- ✅ All game changes require admin approval
- ✅ Submissions are tracked in `gameSubmissions` collection
- ✅ Admins can approve/reject/delete submissions
- ✅ Multi-layer security prevents bypass
- ✅ Clear user experience for both operators and admins
