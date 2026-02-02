import { useAuth } from "../auth/AuthContext";

export default function OperatorDashboard() {
  const { logout } = useAuth();
  return (
    <div style={page}>
      <h2>Operator Dashboard</h2>
      <p>Restricted operational view (demo).</p>
      <button onClick={logout} style={btn}>
        Logout
      </button>
    </div>
  );
}

const page = { padding: 24 };
const btn = { marginTop: 10 };