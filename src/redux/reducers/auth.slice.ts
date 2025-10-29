import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userData: {},
  token: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setStateKey: (state: any, action) => {
      const { key, value } = action.payload;
      if (key in state) {
        state[key] = value;
      }
    },
    // logout: state => {
    //   state.userData = {};
    //   state.token = null;
    // },
    logout: () => initialState,
  },
});

export const { setStateKey, logout } = authSlice.actions;
export default authSlice.reducer;
