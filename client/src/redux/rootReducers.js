import { combineReducers } from "@reduxjs/toolkit";

import app from "./app/appSlice";
import auth from "./auth/authSlice";
import plan from "./plan/planSlice";
import user from "./user/userSlice";
import problem from "./problem/problemSlice";
import exam from "./exam/examSlice";
import database from "./database/dbSlice";
import references from "./references/refSlice";
//Include all the reducer to combine and provide to configure store.

const rootReducer = {
  app,
  auth,
  plan,
  user,
  problem,
  exam,
  database,
  references
};

export default combineReducers(rootReducer);
