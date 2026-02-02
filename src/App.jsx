import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./auth/ProtectedRoute";
import { useAuth } from "./auth/AuthContext"; // same module as AuthProvider

import Login from "./pages/Login";
import OperatorDashboard from "./pages/OperatorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import SessionTimeoutModal from "./components/SessionTimeoutModal";
import TopBar from "./components/TopBar";

function HomeRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/operator"} replace />;
}

function Shell() {
  const { showTimeoutWarning, warningSecondsLeft, extendSession, logout } = useAuth();

  return (
    <>
      {showTimeoutWarning && (
        <SessionTimeoutModal
          secondsLeft={warningSecondsLeft}
          onStaySignedIn={extendSession}
          onLogout={logout}
        />
      )}

      <TopBar />

      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/operator"
          element={
            <ProtectedRoute allowedRoles={["operator", "admin"]}>
              <OperatorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/unauthorized"
          element={
            <div style={{ padding: 24 }}>
              <h2>Unauthorized</h2>
              <a href="/login">Return to Login</a>
            </div>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return <Shell />;
}