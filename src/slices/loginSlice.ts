import axios from 'axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Key } from 'antd/es/table/interface';
import type { User } from '../types/User';
import type { Addresses, Address } from '../types/Addresses';
import type { InitialStateType } from '../types/InitialState';
import routes from '../routes';

export const fetchLogin = createAsyncThunk(
  'login/fetchLogin',
  async (data: { phone: string, password: string, save: boolean }) => {
    const response = await axios.post(routes.login, data);
    return response.data;
  },
);

export const fetchTokenStorage = createAsyncThunk(
  'login/fetchTokenStorage',
  async (refreshTokenStorage: string) => {
    const response = await axios.get(routes.updateTokens, {
      headers: { Authorization: `Bearer ${refreshTokenStorage}` },
    });
    return response.data;
  },
);

export const fetchRemoveAddress = createAsyncThunk(
  'login/fetchRemoveAddress',
  async ({ token, index }: { token?: string, index: number }) => {
    const response = await axios.patch(routes.removeAddress, { index }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
);

export const fetchSelectAddress = createAsyncThunk(
  'login/fetchSelectAddress',
  async ({ token, index }: { token?: string, index: Key }) => {
    const response = await axios.patch(routes.selectAddress, { index }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
);

export const updateTokens = createAsyncThunk(
  'login/updateTokens',
  async (refresh: string | undefined) => {
    const refreshTokenStorage = window.localStorage.getItem('refresh_token');
    if (refreshTokenStorage) {
      const { data } = await axios.get(routes.updateTokens, {
        headers: { Authorization: `Bearer ${refreshTokenStorage}` },
      });
      if (data.user.refreshToken) {
        window.localStorage.setItem('refresh_token', data.user.refreshToken);
        return data;
      }
    } else {
      const { data } = await axios.get(routes.updateTokens, {
        headers: { Authorization: `Bearer ${refresh}` },
      });
      if (data.user.refreshToken) {
        return data;
      }
    }
    return null;
  },
);

export const initialState: InitialStateType = {
  loadingStatus: 'idle',
  error: null,
};

export const fetchFulfilled = fetchLogin.fulfilled;

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    removeToken: (state) => {
      const entries = Object.keys(state);
      entries.forEach((key) => {
        if (key !== 'loadingStatus') {
          state[key] = null;
        }
      });
    },
    changeEmailActivation: (state, { payload }) => {
      state.email = payload;
    },
    changeUserData: (state, { payload }: PayloadAction<{ [key: string]: string }>) => {
      const entries = Object.entries(payload);
      entries.forEach(([key, value]) => { state[key] = value; });
    },
    addAddress: (state, { payload }: PayloadAction<Address>) => {
      if (state.addresses) {
        const currentAddress = state.addresses?.addressList.push(payload);
        state.addresses.currentAddress = currentAddress;
      }
    },
    updateAddress: (state, { payload }
      : PayloadAction<{ oldObject: Address, newObject: Address }>) => {
      if (state.addresses) {
        state.addresses.addressList = state.addresses.addressList.map((address: Address) => {
          if (JSON.stringify(address) === JSON.stringify(payload.oldObject)) {
            return { ...address, ...payload.newObject };
          }
          return address;
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogin.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchLogin.fulfilled, (state, { payload }
        : PayloadAction<{ code: number, user: User }>) => {
        if (payload.code === 1) {
          const entries = Object.entries(payload.user);
          entries.forEach(([key, value]) => { state[key] = value; });
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(fetchLogin.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
      })
      .addCase(fetchTokenStorage.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchTokenStorage.fulfilled, (state, { payload }
        : PayloadAction<{ code: number, user: User }>) => {
        if (payload.code === 1) {
          if (window.localStorage.getItem('refresh_token')) {
            window.localStorage.setItem('refresh_token', payload.user.refreshToken);
          }
          const entries = Object.entries(payload.user);
          entries.forEach(([key, value]) => { state[key] = value; });
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(fetchTokenStorage.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
      })
      .addCase(fetchRemoveAddress.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchRemoveAddress.fulfilled, (state, { payload }
        : PayloadAction<{ code: number, addresses: Addresses }>) => {
        if (payload.code === 1) {
          state.addresses = payload.addresses;
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(fetchRemoveAddress.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
      })
      .addCase(fetchSelectAddress.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchSelectAddress.fulfilled, (state, { payload }
        : PayloadAction<{ code: number, currentAddress: number }>) => {
        if (payload.code === 1 && state.addresses) {
          state.addresses.currentAddress = payload.currentAddress;
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(fetchSelectAddress.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
      })
      .addCase(updateTokens.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(updateTokens.fulfilled, (state, { payload }
        : PayloadAction<{ code: number, user: User }>) => {
        if (payload.code === 1) {
          const entries = Object.entries(payload.user);
          entries.forEach(([key, value]) => { state[key] = value; });
        }
        state.loadingStatus = 'finish';
        state.error = null;
      })
      .addCase(updateTokens.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.error.message ?? null;
      });
  },
});

export const {
  removeToken,
  changeEmailActivation,
  changeUserData,
  addAddress,
  updateAddress,
} = loginSlice.actions;

export default loginSlice.reducer;
