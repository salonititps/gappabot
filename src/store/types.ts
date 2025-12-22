export interface GenericState<T> {
  data?: T;
  loading: boolean;
  error?: any;
  status?: boolean;
}

export const createGenericInitialState = <T>(
  overrides?: Partial<GenericState<T>>,
): GenericState<T> => ({
  data: undefined,
  loading: false,
  error: undefined,
  ...overrides,
});
