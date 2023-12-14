import type { InitialStateType } from './InitialState';

export type ProfileFormsProps = {
  user: InitialStateType;
  setLoading: (arg: boolean) => void;
};
