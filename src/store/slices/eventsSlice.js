import { createSlice } from '@reduxjs/toolkit';

const currentDate = new Date();

const initialState = {
  list: [],
  loading: true,
  selectedEvent: null,
  error: null,
  selectedYear: currentDate.getFullYear(),
  selectedMonth: currentDate.getMonth(),
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action) => {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },
    addEvent: (state, action) => {
      state.list.push(action.payload);
    },
    updateEvent: (state, action) => {
      const index = state.list.findIndex(event => event.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    deleteEvent: (state, action) => {
      state.list = state.list.filter(event => event.id !== action.payload);
    },
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedMonth: (state, action) => {
      state.selectedYear = action.payload.year;
      state.selectedMonth = action.payload.month;
    },
  },
});

export const {
  setEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  setSelectedEvent,
  setLoading,
  setError,
  setSelectedMonth,
} = eventsSlice.actions;

export default eventsSlice.reducer;
