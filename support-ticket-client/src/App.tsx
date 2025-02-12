import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/user/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import ExecutiveDashboard from "./pages/executive/Dashboard";
import { useAuthStore } from "./store/authStore";

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles: string[];
}

function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (user && !allowedRoles.includes(user.role)) {
    const redirectMap: { [key: string]: string } = {
      admin: "/admin",
      executive: "/executive",
      user: "/dashboard",
    };
    return <Navigate to={redirectMap[user.role] || "/login"} />;
  }
  return children;
}

function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <UserDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/executive"
            element={
              <PrivateRoute allowedRoles={["executive"]}>
                <ExecutiveDashboard />
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
