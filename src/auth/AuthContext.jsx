import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { SECURITY } from "../config/security";

const AuthContext = createContext(null);
const now = () => Date.now();

export function AuthProvider({ children }) {
  const { IDLE_TIMEOUT_MS, WARNING_BEFORE_MS, MAX_FAILED_ATTEMPTS, LOCKOUT_MS } = SECURITY;

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

  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [warningSecondsLeft, setWarningSecondsLeft] = useState(Math.floor(WARNING_BEFORE_MS / 1000));
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(0);

  const logoutTimer = useRef(null);
  const warningTimer = useRef(null);
  const warningCountdownRef = useRef(null);

  // session countdown: useTimeout chain (more stable than setInterval)
  const sessionCountdownRef = useRef(null);

  const logoutAtRef = useRef(0);

  const isLocked = lockoutUntil > now();
  const lockoutSecondsLeft = Math.max(0, Math.ceil((lockoutUntil - now()) / 1000));

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

  function clearTimers() {
    clearTimeout(logoutTimer.current);
    clearTimeout(warningTimer.current);

    clearInterval(warningCountdownRef.current);

    // session countdown is a timeout chain now
    clearTimeout(sessionCountdownRef.current);

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
    const tick = () => {
      const msLeft = Math.max(0, logoutAtRef.current - Date.now());

      // ✅ floor prevents 10:00 ↔ 9:59 bounce
      setSessionSecondsLeft(Math.max(0, Math.floor(msLeft / 1000)));

      // stop when expired
      if (msLeft <= 0) return;

      // ✅ align to next second boundary for stable display
      const nextIn = 1000 - (Date.now() % 1000);
      sessionCountdownRef.current = setTimeout(tick, nextIn);
    };

    clearTimeout(sessionCountdownRef.current);
    tick();
  }

  function resetIdleTimers() {
    if (!user) return;

    clearTimers();
    setShowTimeoutWarning(false);

    logoutAtRef.current = Date.now() + IDLE_TIMEOUT_MS;
    startSessionCountdown();

    // warning modal
    warningTimer.current = setTimeout(() => {
      setShowTimeoutWarning(true);

      let secs = Math.floor(WARNING_BEFORE_MS / 1000);
      setWarningSecondsLeft(secs);

      clearInterval(warningCountdownRef.current);
      warningCountdownRef.current = setInterval(() => {
        secs -= 1;
        setWarningSecondsLeft(secs);
        if (secs <= 0) clearInterval(warningCountdownRef.current);
      }, 1000);
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);

    // auto logout
    logoutTimer.current = setTimeout(logout, IDLE_TIMEOUT_MS);
  }

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
  }, [user?.role]);

  useEffect(() => {
    if (!lockoutUntil) return;

    const id = setInterval(() => {
      if (lockoutUntil <= now()) setLockoutUntil(0);
    }, 250);

    return () => clearInterval(id);
  }, [lockoutUntil]);

  function login({ username, password }) {
    if (isLocked) return { ok: false, reason: "LOCKED" };

    const u = username.trim().toLowerCase();
    const okOperator = u === "operator" && password === "Operator123!";
    const okAdmin = u === "admin" && password === "Admin123!";

    if (!okOperator && !okAdmin) {
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

    const role = okAdmin ? "admin" : "operator";
    setUser({ role });
    return { ok: true, role };
  }

  function extendSession() {
    resetIdleTimers();
    setShowTimeoutWarning(false);
  }

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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}