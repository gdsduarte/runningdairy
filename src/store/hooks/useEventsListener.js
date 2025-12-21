import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { subscribeToEvents } from '../../services';
import { setEvents, setLoading, setError } from '../../store/slices/eventsSlice';

export const useEventsListener = () => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events.list);
  const loading = useSelector((state) => state.events.loading);
  const userClubId = useSelector((state) => state.user.profile?.clubId);

  useEffect(() => {
    if (!userClubId) {
      dispatch(setEvents([]));
      dispatch(setLoading(false));
      return;
    }

    dispatch(setLoading(true));

    // Subscribe to ALL events for the user's club (not just one month)
    const unsubscribe = subscribeToEvents(
      userClubId,
      (eventsData) => {
        dispatch(setEvents(eventsData));
      },
      (error) => {
        dispatch(setError(error.message));
      }
    );

    return () => unsubscribe();
  }, [dispatch, userClubId]);

  return { events, loading };
};

