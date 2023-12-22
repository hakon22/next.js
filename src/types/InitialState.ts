import type { Addresses } from './Addresses';

export type LoadingStatus = 'idle' | 'loading' | 'finish' | 'failed';

export type InitialStateType = {
  loadingStatus: LoadingStatus;
  error: string | null;
  id?: number;
  token?: string;
  refreshToken?: string;
  email?: string;
  username?: string;
  phone?: string;
  role?: string;
  addresses?: Addresses,
  orders?: number[],
  [key: string]: Addresses | number[] | string | number | null | undefined;
}
