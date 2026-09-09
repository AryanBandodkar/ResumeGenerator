import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import ResumeInput from "./pages/ResumeInput";
import ResumeReview from "./pages/ResumeReview";
import TemplateSelection from "./pages/TemplateSelection";
import ResumeOutput from "./pages/ResumeOutput";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Application Pages */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/create-resume"
          element={<ResumeInput />}
        />

        <Route
          path="/review-resume"
          element={<ResumeReview />}
        />

        <Route
          path="/template-selection"
          element={<TemplateSelection />}
        />

        {/* Generated Resume / Download Page */}
        <Route
          path="/resume-output"
          element={<ResumeOutput />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;