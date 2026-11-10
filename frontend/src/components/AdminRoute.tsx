
import { Navigate, Outlet } from "react-router-dom";
import authService from "../services/authService";

function AdminRoute() {
  const user = authService.getUser();

  if (!authService.isAuthenticated() || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
