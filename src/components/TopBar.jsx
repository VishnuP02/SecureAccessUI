import { useAuth } from "../auth/AuthContext.jsx";

function formatSeconds(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function TopBar() {
  const { user, logout, sessionSecondsLeft } = useAuth();
  if (!user) return null;

  const warning = sessionSecondsLeft <= 60;

  return (
    <div style={bar}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span style={brand}>SecureAccessUI</span>

        <span style={pill}>
          Role: <b>{user.role}</b>
        </span>

        <span style={{ ...pill, ...(warning ? warnPill : {}) }}>
          Session: <b>{formatSeconds(sessionSecondsLeft)}</b>
        </span>
      </div>

      <button onClick={logout} style={btn}>
        Logout
      </button>
    </div>
  );
}

const bar = {
  position: "sticky",
  top: 0,
  zIndex: 10,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 14px",
  background: "rgba(0,0,0,0.35)",
  borderBottom: "1px solid rgba(255,255,255,0.10)",
  backdropFilter: "blur(6px)",
};

const brand = { fontWeight: 700, letterSpacing: 0.2 };

const pill = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
};

const warnPill = {
  border: "1px solid rgba(255,180,0,0.35)",
  background: "rgba(255,180,0,0.12)",
};

const btn = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};