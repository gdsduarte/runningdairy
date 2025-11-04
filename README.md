# Running Events Calendar 🏃

A modern, responsive web application for running clubs to manage and share running events. Built with React and Firebase.

## Features

- 📅 **Calendar View**: Visual month and list views of running events
- 🔐 **Authentication**: Email/password and Google sign-in
- ➕ **Event Management**: Admins can add running events with details
- 👥 **RSVP System**: Users can sign up for events and see attendees
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🔥 **Real-time Updates**: Instant synchronization using Firebase Firestore

## Tech Stack

- **Frontend**: React 19.2
- **Backend**: Firebase
  - Authentication (Email/Password + Google)
  - Firestore Database
  - Hosting
- **Styling**: Custom CSS with running-themed gradients

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable the following services:
   - **Authentication**: Enable Email/Password and Google sign-in providers
   - **Firestore Database**: Create a database in production mode
   - **Hosting**: Set up hosting (optional)

4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on the web icon (</>)
   - Copy the config object

### 3. Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` and add your Firebase configuration:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

### 4. Set Up Firestore Security Rules

The `firestore.rules` file is already configured. In Firebase Console, go to Firestore Database > Rules and publish the rules from the file.

### 5. Run the Application

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Usage

### For Users

1. **Sign Up/Sign In**: Click "Sign In" in the header to create an account or log in
2. **View Events**: Browse events in calendar or list view
3. **Event Details**: Click on any event to see full details
4. **RSVP**: Click "RSVP" on an event to mark your attendance
5. **See Attendees**: View who else is attending each event

### For Admins

1. **Add Events**: After signing in, click "+ Add Event"
2. **Fill Event Details**:
   - Event Name
   - Location
   - Distance (5K, 10K, Marathon, etc.)
   - Date and Time
   - Registration Link
   - Description (optional)
3. **Submit**: Click "Add Event" to publish

## Firebase Hosting Deployment

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase:
   ```bash
   firebase init
   ```
   - Select "Hosting"
   - Choose your Firebase project
   - Set public directory to: `build`
   - Configure as single-page app: `Yes`

4. Build the app:
   ```bash
   npm run build
   ```

5. Deploy:
   ```bash
   firebase deploy
   ```

## Project Structure

```
src/
├── components/
│   ├── Auth.js              # Authentication modal
│   ├── Auth.css
│   ├── AddEvent.js          # Event creation form
│   ├── AddEvent.css
│   ├── EventCalendar.js     # Calendar display
│   ├── EventCalendar.css
│   ├── EventDetails.js      # Event details & RSVP
│   └── EventDetails.css
├── firebase.js              # Firebase configuration
├── App.js                   # Main app component
├── App.css
├── index.js
└── index.css
```

## Color Scheme

The app uses a running-themed color palette:
- Primary Orange: `#FF6B35`
- Secondary Orange: `#F7931E`
- Dark Blue: `#2c3e50`
- Light Background: `#f5f7fa`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Firebase Authentication Issues
- Ensure Email/Password and Google providers are enabled in Firebase Console
- Check that your domain is added to authorized domains in Firebase Authentication settings

### Firestore Permission Errors
- Verify Firestore security rules are properly set
- Check that users are authenticated before performing write operations

### Build Errors
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

---

Built with ❤️ for the running community 🏃‍♂️🏃‍♀️

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
