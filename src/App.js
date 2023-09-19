import "./App.css";
import Spinner from "./features/components/LoadingSpinner";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  CONNECTION_FAILED,
  CONNECTION_SUCCESSFUL,
  CONNECTION_REQUEST,
} from "./features/slicers/connectSlicer";

function App() {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const connectionState = useSelector((state) => state.connectReducer);

  async function connectWallet() {
    try {
      const { ethereum } = window;
      if (!ethereum) window.open("https://metamask.io/download/", "_blank");
      else {
        dispatch(CONNECTION_REQUEST());
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        }); // deschide pop up metamask
        const payload = {
          account: accounts[0],
        };
        dispatch(CONNECTION_SUCCESSFUL(payload));
        navigate("/LandingPage");
      }
    } catch (error) {
      const payload = {
        msgErr: error.message,
        codeErr: error.code,
      };
      dispatch(CONNECTION_FAILED(payload));
    }
  }

  return (
    <div className="App">
      <h1>This is the wallet connecting page</h1>
      {connectionState.loading ? (
        <Spinner />
      ) : connectionState.errMsg === "" ? (
        <button onClick={() => connectWallet()}>Connect Wallet</button>
      ) : (
        connectionState.errMsg
      )}
    </div>
  );
}

export default App;
