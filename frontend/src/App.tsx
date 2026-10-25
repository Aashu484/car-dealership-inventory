import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { Showroom } from "./pages/Showroom";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/" element={<Showroom />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
