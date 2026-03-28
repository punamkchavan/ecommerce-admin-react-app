import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as productService from '../../api/productService';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ pageSize = 10, pageToken = '' } = {}, { rejectWithValue }) => {
    try {
      return await productService.getProducts(pageSize, pageToken);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      return await productService.createProduct(productData);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await productService.updateProduct(id, data);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete product');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
    nextPageToken: null,
    tokenHistory: [null],
    currentPage: 1,
    pageSize: 10,
  },
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    setProductPage: (state, action) => {
      state.currentPage = action.payload;
    },
    pushProductToken: (state, action) => {
      if (action.payload && !state.tokenHistory.includes(action.payload)) {
        state.tokenHistory.push(action.payload);
      }
    },
    resetProductPagination: (state) => {
      state.currentPage = 1;
      state.tokenHistory = [null];
      state.nextPageToken = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.documents;
        state.nextPageToken = action.payload.nextPageToken;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      });
  },
});

export const { clearProductError, setProductPage, pushProductToken, resetProductPagination } = productSlice.actions;
export default productSlice.reducer;
