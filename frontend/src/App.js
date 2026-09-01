import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Auth/Register/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;