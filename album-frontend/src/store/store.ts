import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import autoMergeLevel2 from "redux-persist/es/stateReconciler/autoMergeLevel2";
import createWebStorage from "redux-persist/es/storage/createWebStorage";
import { baseApi } from "./api/baseApi";
import authReducer from "./reducer/auth";

const storage = createWebStorage("local");

const persistConfig = {
  key: "album",
  storage,
  stateReconciler: autoMergeLevel2,
  // Never persist the RTK Query cache — stale cache prevents queries from
  // re-firing on page load (e.g. the /user/me call in Dashboard)
  blacklist: [baseApi.reducerPath],
};

const rootReducer = combineReducers({
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

const persistedReducer = persistReducer<ReturnType<typeof rootReducer>>(
  persistConfig,
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist dispatches non-serializable actions; ignore them
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
