import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import ResumeInput from "./pages/ResumeInput";
import ResumeReview from "./pages/ResumeReview";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Application */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-resume" element={<ResumeInput />} />
        <Route path="/review-resume" element={<ResumeReview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;