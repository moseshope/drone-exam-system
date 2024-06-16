import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  loader: false,
  images: [],
}

const conceptSlice = createSlice({
  name: 'concept',
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

export const { getPlans, getPlansSuccess, getPlansFailure } = conceptSlice.actions;
export default conceptSlice.reducer;
