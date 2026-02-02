import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLocked, lockoutSecondsLeft } = useAuth();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (loading || isLocked) return;

    setError("");
    setLoading(true);

    const result = login({ username, password });

    if (!result?.ok) {
      if (result?.reason === "LOCKED") {
        setError("Too many attempts. Locked temporarily.");
      } else {
        setError("Invalid credentials.");
      }
      setLoading(false);
      return;
    }

    navigate(result.role === "admin" ? "/admin" : "/operator", { replace: true });
    setLoading(false);
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={{ marginBottom: 6 }}>SecureAccessUI</h2>

        <p style={{ opacity: 0.8, marginTop: 0 }}>
          Demo: <b>operator / Operator123!</b> | <b>admin / Admin123!</b>
        </p>

        {isLocked && (
          <p style={{ marginTop: 10 }}>
            🔒 Account locked. Try again in <b>{lockoutSecondsLeft}s</b>.
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <input
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLocked || loading}
            style={input}
          />

          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLocked || loading}
            style={{ ...input, marginTop: 10 }}
          />

          <button type="submit" disabled={isLocked || loading} style={btn}>
            {loading ? "Signing in..." : "Login"}
          </button>

          {error && <p style={{ marginTop: 12, color: "#ffb4b4" }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}

const wrap = {
  minHeight: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 18,
  color: "#e6eefc",
  background:
    "radial-gradient(1200px 650px at 20% 10%, rgba(27,102,255,0.35), transparent), radial-gradient(900px 500px at 85% 70%, rgba(0,180,255,0.18), transparent), #070b14",
};

const card = {
  width: "min(520px, 100%)",
  borderRadius: 20,
  padding: 22,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 20px 70px rgba(0,0,0,0.45)",
};

const input = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(0,0,0,0.25)",
  color: "#e6eefc",
  outline: "none",
};

const btn = {
  marginTop: 12,
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "linear-gradient(135deg, rgba(27,102,255,1), rgba(0,180,255,1))",
  color: "white",
  cursor: "pointer",
};