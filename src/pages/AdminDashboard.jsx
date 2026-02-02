import { useAuth } from "../auth/AuthContext";

export default function AdminDashboard() {
  const { logout } = useAuth();
  return (
    <div style={page}>
      <h2>Admin Dashboard</h2>
      <p>Admin-only console (demo).</p>
      <button onClick={logout} style={btn}>
        Logout
      </button>
    </div>
  );
}

const page = { padding: 24 };
const btn = { marginTop: 10 };