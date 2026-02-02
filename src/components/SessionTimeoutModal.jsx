export default function SessionTimeoutModal({ secondsLeft, onStaySignedIn, onLogout }) {
  return (
    <div style={backdrop}>
      <div style={modal}>
        <h3 style={{ marginTop: 0 }}>Session Expiring</h3>
        <p>
          You’ll be logged out in <b>{secondsLeft}s</b> due to inactivity.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onLogout} style={secondaryBtn}>
            Logout
          </button>
          <button onClick={onStaySignedIn} style={primaryBtn}>
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
}

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 50,
};

const modal = {
  width: "min(520px, 100%)",
  borderRadius: 16,
  background: "#0b1220",
  color: "#e6eefc",
  border: "1px solid rgba(255,255,255,0.12)",
  padding: 18,
  boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
};

const primaryBtn = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "#1b66ff",
  color: "white",
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "transparent",
  color: "#e6eefc",
  cursor: "pointer",
};