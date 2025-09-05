import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
// import { syncHistoryWithStore, routerReducer } from "react-router-redux";
import storage from "redux-persist/lib/storage";
import logger from "redux-logger";
import {thunk} from "redux-thunk";
import  CourseSlice  from "./slice/courseSlice";
import  BatchSlice  from "./slice/batchSlice";
import FormSlice  from "./slice/formSlice";
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // only 'auth' slice will be persisted
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    course: CourseSlice, 
    batch:BatchSlice,
    form:FormSlice// required for store to be valid
  })
);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk,
      serializableCheck: false, // Ignore check for non-serializable values
    }).concat(logger), // Add logger middleware
});

const persistor = persistStore(store);

export { store, persistor };
