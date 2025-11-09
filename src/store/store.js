import { configureStore } from '@reduxjs/toolkit';
import eventsReducer from './slices/eventsSlice';
import userReducer from './slices/userSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    events: eventsReducer,
    user: userReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'events/setEvents', 
          'events/updateEvent', 
          'events/addEvent',
          'auth/setUser',
          'user/setUserProfile',
          'user/setUserEvents',
          'user/setPastEvents',
          'user/setBadges',
          'user/setLoading',
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.date', 
          'payload.createdAt', 
          'payload.lastLogin',
          'payload',
          'meta.arg',
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'events.list',
          'user.profile',
          'user.userEvents',
          'user.pastEvents',
          'auth.user',
        ],
      },
    }),
});

export default store;
