import { combineReducers } from "@reduxjs/toolkit";

import app from "./app/appSlice";
import auth from "./auth/authSlice";
import plan from "./plan/planSlice";
import user from "./user/userSlice";
import problem from "./problem/problemSlice";
import exam from "./exam/examSlice";
//Include all the reducer to combine and provide to configure store.

const rootReducer = {
  app,
  auth,
  plan,
  user,
  problem,
  exam,
};

export default combineReducers(rootReducer);
