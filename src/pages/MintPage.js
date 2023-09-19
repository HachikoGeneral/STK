import React from "react";
import { useSelector } from "react-redux";

export default function MintPage() {
  const connectionState = useSelector((state) => state.connectReducer);

  return (
    <div>
      <h1>This is the Minting page</h1>
      <p>Your wallet address is {connectionState.account}</p>
    </div>
  );
}
