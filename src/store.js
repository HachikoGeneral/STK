import { configureStore } from "@reduxjs/toolkit";
import connectReducer from "./features/slicers/connectSlicer";
import blockchainReducer from "./features/slicers/blockainSlicer";

export const store = configureStore({
  reducer: { connectReducer, blockchainReducer },
});
