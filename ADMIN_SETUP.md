# Admin Setup Guide

## How to Make a User an Admin

Since user roles are stored in Firestore and protected by security rules, you need to manually update a user's role in the Firebase Console.

### Steps:

1. **Go to Firebase Console**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project

2. **Navigate to Firestore Database**
   - Click on "Firestore Database" in the left sidebar
   - Click on the `users` collection

3. **Find the User**
   - Locate the document with the user's UID
   - You can search by email or UID

4. **Edit the User Document**
   - Click on the user document
   - Find the `role` field
   - Change the value from `"user"` to `"admin"`
   - Click "Update"

5. **Verify**
   - The user will need to sign out and sign back in
   - They should now see Edit and Delete buttons on all events

## User Document Structure

```javascript
{
  uid: "user-unique-id",
  email: "user@example.com",
  displayName: "User Name",
  role: "admin", // or "user"
  createdAt: Timestamp,
  lastLogin: Timestamp
}
```

## Available Roles

- **`user`** (default): Can create events, edit/delete their own events, RSVP to events
- **`admin`**: Can edit and delete ANY event, plus all user permissions

## Security

- Users cannot change their own role (protected by Firestore rules)
- Only Firebase Console administrators can modify roles
- All role checks are done server-side in Firestore rules
