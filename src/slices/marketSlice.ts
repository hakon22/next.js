import axios from 'axios';
import {
  createSlice, createEntityAdapter, createAsyncThunk, type PayloadAction,
} from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { Item } from '../types/Item';
import type { InitialStateType } from '../types/InitialState';
import routes from '../routes';

export const fetchItems = createAsyncThunk(
  'market/fetchItems',
  async () => {
    const response = await axios.get(`http://localhost:3007${routes.getAllItems}`);
    return response.data;
  },
);

export const marketAdapter = createEntityAdapter<Item>();

export const initialState: InitialStateType & { search: Item[] | null } = {
  search: null,
  loadingStatus: 'idle',
  error: null,
};

export const fetchFulfilled = fetchItems.fulfilled;

const marketSlice = createSlice({
  name: 'market',
  initialState: marketAdapter.getInitialState(initialState),
  reducers: {
    marketAdd: marketAdapter.addOne,
    marketAddMany: marketAdapter.addMany,
    marketUpdate: marketAdapter.updateOne,
    marketRemove: marketAdapter.removeOne,
    searchUpdate: (state, { payload }: PayloadAction<Item[] | null>) => {
      state.search = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, { payload }:
        PayloadAction<{ code: number, items: Item[] }>) => {
        if (payload.code === 1) {
          marketAdapter.addMany(state, payload.items);
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
      });
  },
});

export const {
  marketAdd, marketUpdate, marketRemove, searchUpdate, marketAddMany,
} = marketSlice.actions;

export const selectors = marketAdapter.getSelectors<RootState>((state) => state.market);

export default marketSlice.reducer;
