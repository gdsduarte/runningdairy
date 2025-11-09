import { db } from '../firebase';
import { 
  collection, 
  query, 
  orderBy, 
  where,
  onSnapshot, 
  addDoc, 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';

// Subscribe to all events with real-time updates
export const subscribeToEvents = (callback, errorCallback) => {
  const q = query(collection(db, 'events'), orderBy('date', 'asc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const eventsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }));
    callback(eventsData);
  }, errorCallback);

  return unsubscribe;
};

// Subscribe to events for a specific month with real-time updates
export const subscribeToEventsForMonth = (year, month, callback, errorCallback) => {
  // Create start and end dates for the month
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
  
  const q = query(
    collection(db, 'events'),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'asc')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const eventsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }));
    callback(eventsData);
  }, errorCallback);

  return unsubscribe;
};

// Subscribe to a single event with real-time updates
export const subscribeToEvent = (eventId, callback) => {
  const eventRef = doc(db, 'events', eventId);
  
  const unsubscribe = onSnapshot(eventRef, (doc) => {
    if (doc.exists()) {
      callback({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      });
    }
  });

  return unsubscribe;
};

// Create a new event
export const createEvent = async (eventData, userId, userEmail) => {
  try {
    const docRef = await addDoc(collection(db, 'events'), {
      ...eventData,
      date: Timestamp.fromDate(eventData.date),
      attendees: [],
      createdBy: userId,
      createdByEmail: userEmail,
      createdAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating event:', error);
    return { success: false, error: error.message };
  }
};

// Update an event
export const updateEvent = async (eventId, eventData) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const updateData = { ...eventData };
    
    if (eventData.date) {
      updateData.date = Timestamp.fromDate(eventData.date);
    }
    
    await updateDoc(eventRef, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating event:', error);
    return { success: false, error: error.message };
  }
};

// Delete an event
export const deleteEvent = async (eventId) => {
  try {
    await deleteDoc(doc(db, 'events', eventId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { success: false, error: error.message };
  }
};

// RSVP to an event
export const rsvpToEvent = async (eventId, user, shouldAttend, currentAttendees) => {
  try {
    const eventRef = doc(db, 'events', eventId);

    if (shouldAttend) {
      // Get user profile to include club name
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      // Add to attendees
      const attendeeData = {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName || user.displayName || user.email.split('@')[0],
        clubName: userData.clubName || '',
        joinedAt: new Date().toISOString(),
      };
      
      await updateDoc(eventRef, {
        attendees: arrayUnion(attendeeData),
      });
    } else {
      // Remove from attendees - find the exact attendee object
      const attendeeToRemove = currentAttendees.find((a) => a.uid === user.uid);
      if (attendeeToRemove) {
        await updateDoc(eventRef, {
          attendees: arrayRemove(attendeeToRemove),
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating RSVP:', error);
    return { success: false, error: error.message };
  }
};
