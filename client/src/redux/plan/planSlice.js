import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  loader: false,
  plans: [],
}

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    getPlans(state) {
      state.loader = true;
    },
    getPlansSuccess(state, action) {
      state.loader = false;
      state.plans = action.payload.plans;
    },
    getPlansFailure(state) {
      state.loader = false;
      state.plans = [];
    },
  },
});

export const { getPlans, getPlansSuccess, getPlansFailure } = planSlice.actions;
export default planSlice.reducer;
