import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  account: "",
  loading: false,
  errMsg: "",
};

export const connectSlice = createSlice({
  name: "connectSlice",
  initialState,
  reducers: {
    CONNECTION_REQUEST: (state) => {
      state.loading = true;
    },
    CONNECTION_FAILED: (state, action) => {
      state.loading = false;
      state.errMsg = action.payload.msgErr;
    },
    CONNECTION_SUCCESSFUL: (state, action) => {
      state.loading = false;
      state.account = action.payload.account;
    },
  },
});

export const { CONNECTION_SUCCESSFUL, CONNECTION_REQUEST, CONNECTION_FAILED } =
  connectSlice.actions;
export default connectSlice.reducer;
