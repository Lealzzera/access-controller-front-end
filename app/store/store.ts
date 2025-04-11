import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/app/store/features/user/user.slice";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});
