import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  subscribeToUserProfile, 
  subscribeToUserEvents, 
  getUserPastEvents, 
  calculateUserBadges 
} from '../../services';
import { 
  setUserProfile, 
  setUserEvents, 
  setPastEvents, 
  setBadges,
  setLoading,
  clearUserData
} from '../../store/slices/userSlice';

export const useUserProfileListener = (userId) => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.user.profile);
  const userEvents = useSelector((state) => state.user.userEvents);
  const pastEvents = useSelector((state) => state.user.pastEvents);
  const badges = useSelector((state) => state.user.badges);
  const loading = useSelector((state) => state.user.loading);

  useEffect(() => {
    if (!userId) {
      dispatch(clearUserData());
      return;
    }

    dispatch(setLoading(true));

    // Subscribe to user profile
    const unsubscribeProfile = subscribeToUserProfile(userId, (profileData) => {
      dispatch(setUserProfile(profileData));
    });

    // Subscribe to user events
    const unsubscribeEvents = subscribeToUserEvents(userId, (events) => {
      dispatch(setUserEvents(events));
      
      // Calculate past events and badges
      const past = getUserPastEvents(events);
      dispatch(setPastEvents(past));
      
      const earnedBadges = calculateUserBadges(past);
      dispatch(setBadges(earnedBadges));
    });

    return () => {
      unsubscribeProfile();
      unsubscribeEvents();
    };
  }, [userId, dispatch]);

  return { profile, userEvents, pastEvents, badges, loading };
};
