import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getFriendlyErrorMessage } from '../../utils/errorMessages';
import * as adminService from '../../api/adminService';

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(AUTH_URL, {
        email,
        password,
        returnSecureToken: true,
      });
      
      const { idToken, localId, displayName, expiresIn } = response.data;
      
      const user = {
        uid: localId,
        email,
        displayName: displayName || email.split('@')[0],
      };
      
      localStorage.setItem('token', idToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token: idToken, user };
    } catch (error) {
      const errorCode = error.response?.data?.error?.message || 'UNKNOWN_ERROR';
      const message = getFriendlyErrorMessage(errorCode);
      return rejectWithValue(message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email, { rejectWithValue }) => {
    try {
      const RESET_URL = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`;
      await axios.post(RESET_URL, {
        requestType: 'PASSWORD_RESET',
        email,
      });
      return true;
    } catch (error) {
      const errorCode = error.response?.data?.error?.message || 'UNKNOWN_ERROR';
      return rejectWithValue(getFriendlyErrorMessage(errorCode));
    }
  }
);

export const fetchAdminProfile = createAsyncThunk(
  'auth/fetchAdminProfile',
  async (uid, { rejectWithValue }) => {
    try {
      const profile = await adminService.getAdminProfile(uid);
      return profile;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

export const updateAdminName = createAsyncThunk(
  'auth/updateAdminName',
  async ({ uid, name }, { rejectWithValue, dispatch }) => {
    try {
      await adminService.updateAdminProfile(uid, name);
      dispatch(setProfileName(name));
      return { name };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  profile: null,
  isLoading: false,
  error: null,
  resetEmailSent: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.profile = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
      state.resetEmailSent = false;
    },
    setProfileName: (state, action) => {
      if (state.user) {
        state.user.displayName = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.resetEmailSent = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.resetEmailSent = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        if (action.payload?.name) {
          state.user.displayName = action.payload.name;
        }
      })
      .addCase(updateAdminName.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAdminName.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!state.profile) state.profile = {};
        state.profile.name = action.payload.name;
      })
      .addCase(updateAdminName.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, setProfileName } = authSlice.actions;
export default authSlice.reducer;
