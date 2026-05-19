import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isAppReady: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isGuest: false,
  isAppReady: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    setGuestMode: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isGuest = true;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isGuest = false;
    },
    setAppReady: (state) => {
      state.isAppReady = true;
    },
  },
});

export const { setCredentials, updateUser, logout, setAppReady, setGuestMode } =
  authSlice.actions;

export default authSlice.reducer;

export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;

export const selectIsGuest = (state: { auth: AuthState }) => state.auth.isGuest;

export const selectIsLessor = (state: { auth: AuthState }) =>
  state.auth.user?.roles?.includes("LESSOR") ?? false;

export const selectIsAdmin = (state: { auth: AuthState }) =>
  state.auth.user?.roles?.includes("ADMIN") ?? false;

export const selectIsVerified = (state: { auth: AuthState }) =>
  state.auth.user?.is_documents_verified ?? false;

export const selectUserStatus = (state: { auth: AuthState }) =>
  state.auth.user?.status;
