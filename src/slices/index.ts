import { configureStore } from '@reduxjs/toolkit';
import loginReducer from './loginSlice';
import marketReducer from './marketSlice';
import cartReducer from './cartSlice';

const store = configureStore({
  reducer: {
    login: loginReducer,
    market: marketReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
