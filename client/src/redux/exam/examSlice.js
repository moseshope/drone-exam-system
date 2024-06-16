import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  page: 1,
  total: 0,
  pageSize: 10,
  filterValue: "",
};

const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    updatePageState(state, action) {
      state.page = action.payload.page;
      state.total = action.payload.total;
      state.pageSize = action.payload.pageSize;
      state.filterValue = action.payload.filterValue;
    },
  },
});

export const { updatePageState } = examSlice.actions;
export default examSlice.reducer;
