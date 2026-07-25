import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { ADMIN_WHITELIST } from "../config/admin";

// Reactive admin guard — reads from the Zustand store so it updates
// immediately on login/logout without a page refresh.
const AdminRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);

  const isAdmin =
    user?.role === "admin" || ADMIN_WHITELIST.includes(user?.email ?? "");

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
