import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { Cart } from '../types/Cart';

export const cartAdapter = createEntityAdapter<Cart>();

const CartSlice = createSlice({
  name: 'cart',
  initialState: cartAdapter.getInitialState(),
  reducers: {
    cartAdd: cartAdapter.addOne,
    cartUpdate: cartAdapter.updateOne,
    cartRemove: cartAdapter.removeOne,
    cartRemoveAll: cartAdapter.removeAll,
  },
});

export const {
  cartAdd, cartUpdate, cartRemove, cartRemoveAll,
} = CartSlice.actions;

export const selectors = cartAdapter.getSelectors<RootState>((state) => state.cart);

export default CartSlice.reducer;
