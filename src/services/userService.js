import { db, storage } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot, 
  collection, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Upload image to Firebase Storage
export const uploadProfileImage = async (userId, file, imageType) => {
  try {
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const filePath = `users/${userId}/${imageType}_${timestamp}.${fileExt}`;
    const storageRef = ref(storage, filePath);
    
    // Upload file
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return { success: true, url: downloadURL, path: filePath };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: error.message };
  }
};

// Delete image from Firebase Storage
export const deleteProfileImage = async (imagePath) => {
  try {
    if (!imagePath) return { success: true };
    
    const storageRef = ref(storage, imagePath);
    await deleteObject(storageRef);
    
    return { success: true };
  } catch (error) {
    // Ignore errors if file doesn't exist
    console.warn('Error deleting image:', error);
    return { success: true };
  }
};

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
export const subscribeToUserEvents = (userId, userClubId, callback) => {
  const eventsQuery = query(
    collection(db, 'events'),
    where('clubId', '==', userClubId),
    orderBy('date', 'desc')
  );
  
  const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
    const events = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate() : data.date,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      };
    });

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
    // Merge profile fields so we don't overwrite other system fields
    await setDoc(doc(db, 'users', userId), profileData, { merge: true });
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

// Get user data from Firestore
export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    return { success: false, error: error.message };
  }
};

// Check if user is admin
export const isUserAdmin = async (userId) => {
  try {
    const result = await getUserData(userId);
    if (result.success) {
      return result.data.role === 'admin';
    }
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Check if user can edit/delete event
export const canEditEvent = async (event, user) => {
  if (!user) return false;
  
  // User is the creator
  if (event.createdBy === user.uid) return true;
  
  // User is an admin
  const isAdmin = await isUserAdmin(user.uid);
  if (isAdmin) return true;
  
  return false;
};

// Wishlist functions
export const addToWishlist = async (userId, eventId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const currentWishlist = userDoc.data().wishlist || [];
    
    // Check if event is already in wishlist
    if (currentWishlist.includes(eventId)) {
      return { success: true, message: 'Event already in wishlist' };
    }
    
    // Add event to wishlist array
    await setDoc(userRef, {
      wishlist: [...currentWishlist, eventId]
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return { success: false, error: error.message };
  }
};

export const removeFromWishlist = async (userId, eventId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const currentWishlist = userDoc.data().wishlist || [];
    const updatedWishlist = currentWishlist.filter(id => id !== eventId);
    
    await setDoc(userRef, {
      wishlist: updatedWishlist
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return { success: false, error: error.message };
  }
};

export const isEventWishlisted = (userProfile, eventId) => {
  if (!userProfile || !userProfile.wishlist) return false;
  return userProfile.wishlist.includes(eventId);
};
