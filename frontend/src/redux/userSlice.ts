import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  permissions: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setPermissions(state, action) {
      state.permissions = action.payload;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.permissions = null;
    },
  },
});

export const { setUser, setPermissions, clearUser } = userSlice.actions;
export default userSlice.reducer;
