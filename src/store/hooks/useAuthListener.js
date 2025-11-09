import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { subscribeToAuthState } from '../../services';
import { setUser, setLoading, clearUser } from '../../store/slices/authSlice';

export const useAuthListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLoading(true));
    
    const unsubscribe = subscribeToAuthState((currentUser) => {
      if (currentUser) {
        // Serialize Firebase User to plain object
        const serializedUser = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          emailVerified: currentUser.emailVerified,
        };
        dispatch(setUser(serializedUser));
      } else {
        dispatch(clearUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);
};
