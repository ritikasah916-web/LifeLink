import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorDashboard from "./pages/DonorDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function DashboardRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen-loader"><div className="spinner" /><p>Loading LifeLink…</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  const paths = { donor: "/donor-dashboard", hospital: "/hospital-dashboard", admin: "/admin-dashboard" };
  return <Navigate to={paths[user.role] || "/login"} replace />;
}
function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen-loader"><div className="spinner" /><p>Loading LifeLink…</p></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
    <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
    <Route path="/dashboard" element={<DashboardRedirect />} />
    <Route path="/donor-dashboard" element={<ProtectedRoute allowedRoles={["donor"]}><DonorDashboard /></ProtectedRoute>} />
    <Route path="/hospital-dashboard" element={<ProtectedRoute allowedRoles={["hospital"]}><HospitalDashboard /></ProtectedRoute>} />
    <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}