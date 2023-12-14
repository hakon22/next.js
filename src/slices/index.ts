import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import loginReducer from './loginSlice';
import marketReducer, { pokemonApi } from './marketSlice';
import cartReducer from './cartSlice';

const store = () => configureStore({
  reducer: {
    login: loginReducer,
    market: marketReducer,
    cart: cartReducer,
    [pokemonApi.reducerPath]: pokemonApi.reducer,
  },
  middleware: (gDM) => gDM().concat(pokemonApi.middleware),
});

export type AppStore = ReturnType<typeof store>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export default createWrapper<AppStore>(store);
