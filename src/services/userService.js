import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy 
} from 'firebase/firestore';

// Subscribe to user profile with real-time updates
export const subscribeToUserProfile = (userId, callback) => {
  const profileRef = doc(db, 'users', userId);
  
  const unsubscribe = onSnapshot(profileRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback(null);
    }
  });

  return unsubscribe;
};

// Subscribe to user's attended events with real-time updates
export const subscribeToUserEvents = (userId, callback) => {
  const eventsQuery = query(
    collection(db, 'events'),
    orderBy('date', 'desc')
  );
  
  const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }));

    // Filter events where user is attending
    const userEvents = events.filter(event => 
      event.attendees?.some(attendee => attendee.uid === userId)
    );

    callback(userEvents);
  });

  return unsubscribe;
};

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, 'users', userId), profileData);
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
};

// Get user's past events
export const getUserPastEvents = (userEvents) => {
  const now = new Date();
  return userEvents.filter(event => event.date < now);
};

// Calculate user badges based on events
export const calculateUserBadges = (pastEvents) => {
  const earnedBadges = [];
  const eventCount = pastEvents.length;

  // First Event Badge
  if (eventCount >= 1) {
    earnedBadges.push({
      id: 'first-event',
      name: 'First Steps',
      description: 'Attended your first event',
      icon: '🎉',
      color: '#FFD700'
    });
  }

  // 5 Events Badge
  if (eventCount >= 5) {
    earnedBadges.push({
      id: 'five-events',
      name: 'Regular Runner',
      description: 'Completed 5 events',
      icon: '🏃',
      color: '#FF6B35'
    });
  }

  // 10 Events Badge
  if (eventCount >= 10) {
    earnedBadges.push({
      id: 'ten-events',
      name: 'Dedicated Athlete',
      description: 'Completed 10 events',
      icon: '🏅',
      color: '#667eea'
    });
  }

  // 25 Events Badge
  if (eventCount >= 25) {
    earnedBadges.push({
      id: 'twentyfive-events',
      name: 'Marathon Master',
      description: 'Completed 25 events',
      icon: '👑',
      color: '#f093fb'
    });
  }

  // Early Bird Badge (attended event in current month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const hasCurrentMonthEvent = pastEvents.some(event => 
    event.date.getMonth() === currentMonth && 
    event.date.getFullYear() === currentYear
  );
  
  if (hasCurrentMonthEvent) {
    earnedBadges.push({
      id: 'early-bird',
      name: 'Early Bird',
      description: 'Attended an event this month',
      icon: '🌅',
      color: '#f7d31d'
    });
  }

  return earnedBadges;
};
