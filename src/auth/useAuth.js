import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { SECURITY } from "../config/security";

const AuthContext = createContext(null);
const now = () => Date.now();

export function AuthProvider({ children }) {
  const { IDLE_TIMEOUT_MS, WARNING_BEFORE_MS, MAX_FAILED_ATTEMPTS, LOCKOUT_MS } = SECURITY;

  // -----------------------------
  // Persistent session state
  // -----------------------------
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem("sa_user");
    return raw ? JSON.parse(raw) : null;
  });

  const [failedAttempts, setFailedAttempts] = useState(() => {
    const raw = sessionStorage.getItem("sa_failed");
    return raw ? Number(raw) : 0;
  });

  const [lockoutUntil, setLockoutUntil] = useState(() => {
    const raw = sessionStorage.getItem("sa_lockout_until");
    return raw ? Number(raw) : 0;
  });

  // -----------------------------
  // Session / timeout UI state
  // -----------------------------
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [warningSecondsLeft, setWarningSecondsLeft] = useState(
    Math.floor(WARNING_BEFORE_MS / 1000)
  );
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(0);

  // -----------------------------
  // Timers / refs
  // -----------------------------
  const logoutTimer = useRef(null);
  const warningTimer = useRef(null);
  const warningCountdownRef = useRef(null);
  const sessionCountdownRef = useRef(null);
  const logoutAtRef = useRef(0);

  const isLocked = lockoutUntil > now();
  const lockoutSecondsLeft = Math.max(0, Math.ceil((lockoutUntil - now()) / 1000));

  // -----------------------------
  // Persistence effects
  // -----------------------------
  useEffect(() => {
    if (user) sessionStorage.setItem("sa_user", JSON.stringify(user));
    else sessionStorage.removeItem("sa_user");
  }, [user]);

  useEffect(() => {
    sessionStorage.setItem("sa_failed", String(failedAttempts));
  }, [failedAttempts]);

  useEffect(() => {
    sessionStorage.setItem("sa_lockout_until", String(lockoutUntil || 0));
  }, [lockoutUntil]);

  // -----------------------------
  // Timer helpers
  // -----------------------------
  function clearTimers() {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (warningCountdownRef.current) clearInterval(warningCountdownRef.current);
    if (sessionCountdownRef.current) clearInterval(sessionCountdownRef.current);

    logoutTimer.current = null;
    warningTimer.current = null;
    warningCountdownRef.current = null;
    sessionCountdownRef.current = null;
  }

  function logout() {
    clearTimers();
    setShowTimeoutWarning(false);
    setSessionSecondsLeft(0);
    setUser(null);
  }

  function startSessionCountdown() {
    const update = () => {
      const msLeft = Math.max(0, logoutAtRef.current - Date.now());
      setSessionSecondsLeft(Math.ceil(msLeft / 1000));
    };

    update();

    if (sessionCountdownRef.current) clearInterval(sessionCountdownRef.current);
    sessionCountdownRef.current = setInterval(update, 1000);
  }

  function resetIdleTimers() {
    if (!user) return;

    clearTimers();
    setShowTimeoutWarning(false);

    logoutAtRef.current = Date.now() + IDLE_TIMEOUT_MS;
    startSessionCountdown();

    // Warning modal
    warningTimer.current = setTimeout(() => {
      setShowTimeoutWarning(true);

      let secs = Math.floor(WARNING_BEFORE_MS / 1000);
      setWarningSecondsLeft(secs);

      if (warningCountdownRef.current) clearInterval(warningCountdownRef.current);
      warningCountdownRef.current = setInterval(() => {
        secs -= 1;
        setWarningSecondsLeft(secs);
        if (secs <= 0) clearInterval(warningCountdownRef.current);
      }, 1000);
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);

    // Auto logout
    logoutTimer.current = setTimeout(logout, IDLE_TIMEOUT_MS);
  }

  // -----------------------------
  // Activity listeners
  // -----------------------------
  useEffect(() => {
    if (!user) return;

    const activity = () => resetIdleTimers();

    window.addEventListener("mousemove", activity);
    window.addEventListener("keydown", activity);
    window.addEventListener("click", activity);
    window.addEventListener("scroll", activity);

    resetIdleTimers();

    return () => {
      window.removeEventListener("mousemove", activity);
      window.removeEventListener("keydown", activity);
      window.removeEventListener("click", activity);
      window.removeEventListener("scroll", activity);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  // -----------------------------
  // Auto-unlock after lockout
  // -----------------------------
  useEffect(() => {
    if (!lockoutUntil) return;

    const id = setInterval(() => {
      if (lockoutUntil <= now()) setLockoutUntil(0);
    }, 250);

    return () => clearInterval(id);
  }, [lockoutUntil]);

  // -----------------------------
  // Auth logic
  // -----------------------------
  function login(username, password) {
    if (isLocked) return { ok: false, reason: "LOCKED" };

    const u = username.trim().toLowerCase();
    const isOperator = u === "operator" && password === "Operator123!";
    const isAdmin = u === "admin" && password === "Admin123!";

    if (!isOperator && !isAdmin) {
      const next = failedAttempts + 1;
      setFailedAttempts(next);

      if (next >= MAX_FAILED_ATTEMPTS) {
        setFailedAttempts(0);
        setLockoutUntil(now() + LOCKOUT_MS);
        return { ok: false, reason: "LOCKED" };
      }

      return { ok: false, reason: "INVALID" };
    }

    setFailedAttempts(0);
    setLockoutUntil(0);

    const role = isAdmin ? "admin" : "operator";
    setUser({ role });

    return { ok: true, role };
  }

  function extendSession() {
    resetIdleTimers();
    setShowTimeoutWarning(false);
  }

  // -----------------------------
  // Context value
  // -----------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,

        showTimeoutWarning,
        warningSecondsLeft,
        extendSession,

        isLocked,
        lockoutSecondsLeft,

        sessionSecondsLeft,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Named export hook (matches: import { useAuth } from "./AuthContext";)
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}