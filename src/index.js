import React from "react";
import ReactDOM from "react-dom/client";
import { store } from "./store";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import LandingPage from "./pages/LandingPage";
import MintPage from "./pages/MintPage";
import StakePage from "./pages/StakePage";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Provider store={store}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/mintpage" element={<MintPage />} />
        <Route path="/stakepage" element={<StakePage />} />
      </Routes>
    </Provider>
  </BrowserRouter>
);
