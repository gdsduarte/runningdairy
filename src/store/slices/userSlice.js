import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  userEvents: [],
  pastEvents: [],
  badges: [],
  loading: true,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      state.profile = action.payload;
      state.loading = false;
    },
    setUserEvents: (state, action) => {
      state.userEvents = action.payload;
    },
    setPastEvents: (state, action) => {
      state.pastEvents = action.payload;
    },
    setBadges: (state, action) => {
      state.badges = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearUserData: (state) => {
      state.profile = null;
      state.userEvents = [];
      state.pastEvents = [];
      state.badges = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setUserProfile,
  setUserEvents,
  setPastEvents,
  setBadges,
  setLoading,
  setError,
  clearUserData,
} = userSlice.actions;

export default userSlice.reducer;
