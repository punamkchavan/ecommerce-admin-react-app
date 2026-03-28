import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as categoryService from '../../api/categoryService';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async ({ pageSize = 10, pageToken = '' } = {}, { rejectWithValue }) => {
    try {
      return await categoryService.getCategories(pageSize, pageToken);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch categories');
    }
  }
);

export const addCategory = createAsyncThunk(
  'categories/addCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      return await categoryService.createCategory(categoryData);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await categoryService.updateCategory(id, data);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      return await categoryService.deleteCategory(id);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete category');
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
    nextPageToken: null,
    tokenHistory: [null], // [null, token1, token2...]
    currentPage: 1,
    pageSize: 10,
  },
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    pushToken: (state, action) => {
      if (action.payload && !state.tokenHistory.includes(action.payload)) {
        state.tokenHistory.push(action.payload);
      }
    },
    resetPagination: (state) => {
      state.currentPage = 1;
      state.tokenHistory = [null];
      state.nextPageToken = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.documents;
        state.nextPageToken = action.payload.nextPageToken;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter(cat => cat.id !== action.payload);
      });
  },
});

export const { clearCategoryError, setPage, pushToken, resetPagination } = categorySlice.actions;
export default categorySlice.reducer;
