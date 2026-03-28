import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as customerService from '../../api/customerService';

export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async ({ pageSize = 10, pageToken = '' } = {}, { rejectWithValue }) => {
    try {
      return await customerService.getCustomers(pageSize, pageToken);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch customers');
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (id, { rejectWithValue }) => {
    try {
      return await customerService.getCustomerById(id);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch customer details');
    }
  }
);

const customerSlice = createSlice({
  name: 'customers',
  initialState: {
    items: [],
    selectedCustomer: null,
    isLoading: false,
    error: null,
    nextPageToken: null,
    tokenHistory: [null],
    currentPage: 1,
    pageSize: 10,
  },
  reducers: {
    clearCustomerError: (state) => {
      state.error = null;
    },
    setCustomerPage: (state, action) => {
      state.currentPage = action.payload;
    },
    pushCustomerToken: (state, action) => {
      if (action.payload && !state.tokenHistory.includes(action.payload)) {
        state.tokenHistory.push(action.payload);
      }
    },
    resetCustomerPagination: (state) => {
      state.currentPage = 1;
      state.tokenHistory = [null];
      state.nextPageToken = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.documents;
        state.nextPageToken = action.payload.nextPageToken;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCustomerById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCustomerError, setCustomerPage, pushCustomerToken, resetCustomerPagination } = customerSlice.actions;
export default customerSlice.reducer;
