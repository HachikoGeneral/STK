import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stakingContract: undefined,
  myTokenContract: undefined,
  loading: false,
  errMsg: "",
};

export const blockchainSlice = createSlice({
  name: "blockchainSlice",
  initialState,
  reducers: {
    CONTRACTS_REQUEST: (state) => {
      state.loading = true;
    },
    CONTRACTS_SUCCESSFUL: (state, action) => {
      state.loading = false;
      state.stakingContract = action.payload.stake;
      state.myTokenContract = action.payload.token;
    },
    CONTRACTS_FAILED: (state, action) => {
      state.loading = false;
      state.errMsg = action.payload.msgErr;
    },
  },
});

export const { CONTRACTS_REQUEST, CONTRACTS_SUCCESSFUL, CONTRACTS_FAILED } =
  blockchainSlice.actions;

export default blockchainSlice.reducer;
