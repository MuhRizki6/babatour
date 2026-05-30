import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { user, ready } = useAuth();
  if (!ready)
    return (
      <div className="min-h-screen grid place-items-center bg-[color:var(--bg)]">
        <div className="text-muted font-serif-display text-xl">Loading...</div>
      </div>
    );
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
};
