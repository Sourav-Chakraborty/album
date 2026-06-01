import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import { authApi } from "../api/auth";

interface UserAuth {
  isAuthenticate: boolean;
  user: User | null;
}

interface User {
  id: number;
  name: string;
  email: string;
  medias: Array<{ id: number; name: string }>;
}

const initialState: UserAuth = {
  isAuthenticate: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setIsAuthenticate: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticate = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    (builder.addMatcher(
      isAnyOf(authApi.endpoints.login.matchFulfilled),
      (state) => {
        state.isAuthenticate = true;
      },
    ),
      builder.addMatcher(
        authApi.endpoints.me.matchFulfilled,
        (state, action) => {
          state.user = action.payload.user;
        },
      ),
      builder.addMatcher(
        isAnyOf(
          authApi.endpoints.logout.matchFulfilled,
          authApi.endpoints.logout.matchRejected,
          authApi.endpoints.me.matchRejected,
        ),
        (state, action) => {
          console.log("action", action.payload?.tokenNotFound);
          state.isAuthenticate = false;
          state.user = null;

          const isTokenNotFound = action.payload?.tokenNotFound;
          if (isTokenNotFound) {
            alert("Please allow cookies to continue");
          }
        },
      ));
  },
});

export const { setIsAuthenticate, setUser } = authSlice.actions;
export default authSlice.reducer;
