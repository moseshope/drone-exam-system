import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  loader: false,
  user: {},
  plan: {},
  errors: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state) {
      state.loader = true;
      state.errors = {};
    },
    register(state) {
      state.loader = true;
      state.errors = {};
    },
    logout(state) {
      state.loader = true;
      state.errors = {};
    },
    logoutSuccess(state) {
      state.loader = false;
      state.isAuthenticated = false;
      state.user = {};
      state.errors = {};
    },
    loginSuccess(state, action) {
      state.loader = false;
      state.user = action.payload.user;
      state.isAuthenticated = !!action.payload.token;
      state.errors = {};
    },
    loginFailure(state, action) {
      state.loader = false;
      state.isAuthenticated = false;
      state.errors = action.payload.errors;
    },
    clearErrors(state) {
      state.errors = {};
    },
    getUser(state) {
      state.loader = true;
      state.errors = {};
    },
    getUserSuccess(state, action) {
      state.loader = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    },
    getUserFailure(state) {
      state.loader = false;
      state.isAuthenticated = false;
      state.user = {};
    },
    updateProfile(state) {
      state.loader = true;
      state.errors = {};
    },
    updateProfileSuccess(state, action) {
      state.loader = false;
      state.user = action.payload.user;
    },
    updateProfileFailure(state, action) {
      state.loader = false;
      state.errors = action.payload.errors;
    },
    updatePassword(state) {
      state.loader = true;
      state.errors = {};
    },
    updatePasswordSuccess(state, action) {
      state.loader = false;
    },
    updatePasswordFailure(state, action) {
      state.loader = false;
      state.errors = action.payload.errors;
    },
    deleteAccount(state) {
      state.loader = true;
      state.errors = {};
    },
    deleteAccountFailure(state, action) {
      state.loader = false;
      state.errors = action.payload.errors;
    },
    getPlan(state) {
      state.loader = true;
    },
    getPlanSuccess(state, action) {
      state.loader = false;
      state.plan = action.payload.plan;
    },
    getPlanFailure(state) {
      state.loader = false;
      state.plan = null;
    },
  },
});

export const {
  login,
  register,
  logout,
  logoutSuccess,
  getUser,
  getUserSuccess,
  getUserFailure,
  loginSuccess,
  loginFailure,
  clearErrors,
  updateProfile,
  updateProfileSuccess,
  updateProfileFailure,
  updatePassword,
  updatePasswordSuccess,
  updatePasswordFailure,
  deleteAccount,
  deleteAccountFailure,
  getPlan,
  getPlanSuccess,
  getPlanFailure,
} = authSlice.actions;
export default authSlice.reducer;
