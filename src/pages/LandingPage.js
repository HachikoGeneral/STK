import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  let navigate = useNavigate();
  return (
    <div>
      <h1>🚀🛰️📡👾</h1>
      <button onClick={() => navigate("/stakepage")}>Staking</button>
    </div>
  );
}
