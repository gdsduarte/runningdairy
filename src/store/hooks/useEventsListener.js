import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { subscribeToEventsForMonth } from '../../services';
import { setEvents, setLoading, setError } from '../../store/slices/eventsSlice';

export const useEventsListener = () => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events.list);
  const loading = useSelector((state) => state.events.loading);
  const selectedYear = useSelector((state) => state.events.selectedYear);
  const selectedMonth = useSelector((state) => state.events.selectedMonth);
  const userClubId = useSelector((state) => state.user.profile?.clubId);

  useEffect(() => {
    if (!userClubId) {
      dispatch(setEvents([]));
      dispatch(setLoading(false));
      return;
    }

    dispatch(setLoading(true));

    // Subscribe only to events for the currently selected month and user's club
    const unsubscribe = subscribeToEventsForMonth(
      userClubId,
      selectedYear,
      selectedMonth,
      (eventsData) => {
        dispatch(setEvents(eventsData));
      },
      (error) => {
        dispatch(setError(error.message));
      }
    );

    return () => unsubscribe();
  }, [dispatch, selectedYear, selectedMonth, userClubId]);

  return { events, loading };
};

