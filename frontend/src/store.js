// frontend/src/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice'; // 👈 Import the file you just created

const store = configureStore({
  reducer: {
    auth: authReducer, // 👈 Add it to the reducer list
  },
});

export default store;