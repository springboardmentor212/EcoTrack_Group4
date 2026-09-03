import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Auth/Register/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword/ResetPassword";

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

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />


      </Routes>
    </BrowserRouter>
  );
}

export default App;