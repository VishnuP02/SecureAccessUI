import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function AdminDashboard() {
  const { logout } = useAuth();

  const securityEvents = [
    { time: "10:15 PM", event: "Failed Login", user: "jdoe" },
    { time: "10:22 PM", event: "Account Locked", user: "operator1" },
    { time: "10:35 PM", event: "Password Reset", user: "admin" },
  ];

  const activeSessions = [
    {
      username: "admin",
      loginTime: "Current Session",
      ipAddress: "192.168.1.101",
      status: "Active",
    },
    {
      username: "operator",
      loginTime: "10:02 PM",
      ipAddress: "192.168.1.105",
      status: "Active",
    },
    {
      username: "jdoe",
      loginTime: "10:15 PM",
      ipAddress: "192.168.1.110",
      status: "Flagged",
    },
  ];

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem("secureaccess-users");

    return savedUsers
      ? JSON.parse(savedUsers)
      : [
          { username: "admin", role: "Admin", status: "Active" },
          { username: "operator", role: "Operator", status: "Active" },
          { username: "jdoe", role: "Operator", status: "Locked" },
        ];
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const savedLogs = localStorage.getItem("secureaccess-auditlogs");

    return savedLogs
      ? JSON.parse(savedLogs)
      : [
          {
            timestamp: "10:01 PM",
            user: "admin",
            action: "Viewed admin dashboard",
          },
          {
            timestamp: "10:15 PM",
            user: "jdoe",
            action: "Failed login attempt",
          },
          {
            timestamp: "10:22 PM",
            user: "system",
            action: "Locked operator1 account",
          },
          {
            timestamp: "10:35 PM",
            user: "admin",
            action: "Password reset requested",
          },
        ];
  });

  const [newUsername, setNewUsername] = useState("");
  const [newRole, setNewRole] = useState("Operator");
  const [searchTerm, setSearchTerm] = useState("");

  const failedLogins = 17;

  const lockedAccounts = users.filter((user) => user.status === "Locked").length;
  const activeUsers = users.filter((user) => user.status === "Active").length;
  const disabledUsers = users.filter((user) => user.status === "Disabled").length;

  const lockedAccountPenalty = lockedAccounts * 15;
  const disabledAccountPenalty = disabledUsers * 5;
  const failedLoginPenalty = Math.floor(failedLogins / 2);

  const securityRiskScore = Math.max(
    0,
    100 - lockedAccountPenalty - disabledAccountPenalty - failedLoginPenalty
  );

  const riskLevel =
    securityRiskScore >= 90
      ? "Low Risk"
      : securityRiskScore >= 70
      ? "Moderate Risk"
      : "High Risk";

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const analytics = [
    { event: "Failed Logins", count: failedLogins },
    { event: "Locked Accounts", count: lockedAccounts },
    { event: "Disabled Accounts", count: disabledUsers },
    { event: "Active Users", count: activeUsers },
  ];

  const recommendations = [];

  if (lockedAccounts > 0) {
    recommendations.push(
      "Investigate locked accounts for possible brute-force login attempts."
    );
  }

  if (failedLogins > 10) {
    recommendations.push(
      "Review failed login activity and consider enforcing MFA for privileged accounts."
    );
  }

  if (disabledUsers > 0) {
    recommendations.push(
      "Review disabled accounts and confirm whether access should remain revoked."
    );
  }

  if (securityRiskScore < 70) {
    recommendations.push(
      "Security posture is degraded. Immediate administrator review is recommended."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("No urgent security recommendations at this time.");
  }

  const trendData = [
    { label: "Failed Logins", value: failedLogins },
    { label: "Locked Accounts", value: lockedAccounts },
    { label: "Disabled Accounts", value: disabledUsers },
    { label: "Active Users", value: activeUsers },
  ];

  useEffect(() => {
    localStorage.setItem("secureaccess-users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("secureaccess-auditlogs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  function getCurrentTime() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function addAuditLog(action) {
    const newLog = {
      timestamp: getCurrentTime(),
      user: "admin",
      action,
    };

    setAuditLogs((previousLogs) => [newLog, ...previousLogs]);
  }

  function handleUserAction(username, currentStatus) {
    let newStatus;
    let auditAction;

    if (currentStatus === "Locked") {
      newStatus = "Active";
      auditAction = `Unlocked ${username} account`;
    } else if (currentStatus === "Active") {
      newStatus = "Disabled";
      auditAction = `Disabled ${username} account`;
    } else {
      newStatus = "Active";
      auditAction = `Enabled ${username} account`;
    }

    setUsers((previousUsers) =>
      previousUsers.map((user) =>
        user.username === username ? { ...user, status: newStatus } : user
      )
    );

    addAuditLog(auditAction);
  }

  function handleCreateUser(event) {
    event.preventDefault();

    const trimmedUsername = newUsername.trim();

    if (!trimmedUsername) {
      return;
    }

    const userAlreadyExists = users.some(
      (user) => user.username.toLowerCase() === trimmedUsername.toLowerCase()
    );

    if (userAlreadyExists) {
      addAuditLog(`Rejected duplicate user creation attempt for ${trimmedUsername}`);
      setNewUsername("");
      return;
    }

    const createdUser = {
      username: trimmedUsername,
      role: newRole,
      status: "Active",
    };

    setUsers((previousUsers) => [...previousUsers, createdUser]);
    addAuditLog(`Created ${trimmedUsername} account with ${newRole} role`);
    setNewUsername("");
    setNewRole("Operator");
  }

  function exportAuditLogs() {
    const headers = ["Timestamp", "User", "Action"];

    const rows = auditLogs.map((log) => [
      log.timestamp,
      log.user,
      log.action,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "secureaccess-audit-log.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    addAuditLog("Exported audit log CSV report");
  }

  function resetDemoData() {
    localStorage.removeItem("secureaccess-users");
    localStorage.removeItem("secureaccess-auditlogs");

    setUsers([
      { username: "admin", role: "Admin", status: "Active" },
      { username: "operator", role: "Operator", status: "Active" },
      { username: "jdoe", role: "Operator", status: "Locked" },
    ]);

    setAuditLogs([
      {
        timestamp: "10:01 PM",
        user: "admin",
        action: "Viewed admin dashboard",
      },
      {
        timestamp: "10:15 PM",
        user: "jdoe",
        action: "Failed login attempt",
      },
      {
        timestamp: "10:22 PM",
        user: "system",
        action: "Locked operator1 account",
      },
      {
        timestamp: "10:35 PM",
        user: "admin",
        action: "Password reset requested",
      },
    ]);
  }

  return (
    <div style={page}>
      <h1>Security Operations Dashboard</h1>

      <p style={subtitle}>
        Monitor users, sessions, failed logins, locked accounts, and security activity.
      </p>

      <div style={cardContainer}>
        <div style={card}>
          <h3>Users</h3>
          <p style={metric}>{users.length}</p>
        </div>

        <div style={card}>
          <h3>Active Users</h3>
          <p style={metric}>{activeUsers}</p>
        </div>

        <div style={card}>
          <h3>Failed Logins</h3>
          <p style={metric}>{failedLogins}</p>
        </div>

        <div style={card}>
          <h3>Locked Accounts</h3>
          <p style={metric}>{lockedAccounts}</p>
        </div>

        <div style={card}>
          <h3>Security Risk Score</h3>
          <p style={metric}>{securityRiskScore}/100</p>
          <span
            style={
              riskLevel === "Low Risk"
                ? activeBadge
                : riskLevel === "Moderate Risk"
                ? warningBadge
                : lockedBadge
            }
          >
            {riskLevel}
          </span>
        </div>
      </div>

      <section style={section}>
        <h2>Risk Score Breakdown</h2>

        <div style={breakdownGrid}>
          <div style={breakdownCard}>
            <strong>Locked Account Penalty</strong>
            <p style={breakdownMetric}>-{lockedAccountPenalty}</p>
          </div>

          <div style={breakdownCard}>
            <strong>Disabled Account Penalty</strong>
            <p style={breakdownMetric}>-{disabledAccountPenalty}</p>
          </div>

          <div style={breakdownCard}>
            <strong>Failed Login Penalty</strong>
            <p style={breakdownMetric}>-{failedLoginPenalty}</p>
          </div>
        </div>
      </section>

      <section style={section}>
        <h2>Security Recommendations</h2>

        <div style={noticeBox}>
          {recommendations.map((recommendation, index) => (
            <p key={index} style={recommendationItem}>
              • {recommendation}
            </p>
          ))}
        </div>
      </section>

      <section style={section}>
        <h2>Add New User</h2>

        <form onSubmit={handleCreateUser} style={form}>
          <input
            type="text"
            placeholder="Enter username"
            value={newUsername}
            onChange={(event) => setNewUsername(event.target.value)}
            style={input}
          />

          <select
            value={newRole}
            onChange={(event) => setNewRole(event.target.value)}
            style={input}
          >
            <option value="Operator">Operator</option>
            <option value="Admin">Admin</option>
          </select>

          <button type="submit" style={primaryBtn}>
            Create User
          </button>
        </form>
      </section>

      <section style={section}>
        <h2>Recent Security Events</h2>

        <table style={table}>
          <thead>
            <tr>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Event</th>
              <th style={thStyle}>User</th>
            </tr>
          </thead>

          <tbody>
            {securityEvents.map((event, index) => (
              <tr key={index}>
                <td style={tdStyle}>{event.time}</td>
                <td style={tdStyle}>{event.event}</td>
                <td style={tdStyle}>{event.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={section}>
        <h2>User Management</h2>

        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          style={searchInput}
        />

        <table style={table}>
          <thead>
            <tr>
              <th style={thStyle}>Username</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={index}>
                <td style={tdStyle}>{user.username}</td>
                <td style={tdStyle}>{user.role}</td>
                <td style={tdStyle}>
                  <span
                    style={
                      user.status === "Locked"
                        ? lockedBadge
                        : user.status === "Disabled"
                        ? disabledBadge
                        : activeBadge
                    }
                  >
                    {user.status}
                  </span>
                </td>
                <td style={tdStyle}>
                  {user.username === "admin" ? (
                    <span style={protectedText}>Protected</span>
                  ) : (
                    <button
                      style={smallBtn}
                      onClick={() => handleUserAction(user.username, user.status)}
                    >
                      {user.status === "Locked"
                        ? "Unlock"
                        : user.status === "Disabled"
                        ? "Enable"
                        : "Disable"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={section}>
        <h2>Session Activity</h2>

        <table style={table}>
          <thead>
            <tr>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Login Time</th>
              <th style={thStyle}>IP Address</th>
              <th style={thStyle}>Session Status</th>
            </tr>
          </thead>

          <tbody>
            {activeSessions.map((session, index) => (
              <tr key={index}>
                <td style={tdStyle}>{session.username}</td>
                <td style={tdStyle}>{session.loginTime}</td>
                <td style={tdStyle}>{session.ipAddress}</td>
                <td style={tdStyle}>
                  <span
                    style={
                      session.status === "Active" ? activeBadge : lockedBadge
                    }
                  >
                    {session.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={section}>
        <h2>Security Analytics</h2>

        <table style={table}>
          <thead>
            <tr>
              <th style={thStyle}>Event</th>
              <th style={thStyle}>Count</th>
            </tr>
          </thead>

          <tbody>
            {analytics.map((item, index) => (
              <tr key={index}>
                <td style={tdStyle}>{item.event}</td>
                <td style={tdStyle}>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={section}>
        <h2>Security Trend Charts</h2>

        <div style={chartGrid}>
          <div style={chartCard}>
            <h3>Security Event Volume</h3>

            {trendData.map((item, index) => (
              <div key={index} style={barRow}>
                <span style={barLabel}>{item.label}</span>

                <div style={barTrack}>
                  <div
                    style={{
                      ...barFill,
                      width: `${Math.min(item.value * 5, 100)}%`,
                    }}
                  />
                </div>

                <span style={barValue}>{item.value}</span>
              </div>
            ))}
          </div>

          <div style={chartCard}>
            <h3>Account Health Mix</h3>

            <div style={barRow}>
              <span style={barLabel}>Active Users</span>
              <div style={barTrack}>
                <div
                  style={{
                    ...barFill,
                    width: `${Math.max(activeUsers * 20, 8)}%`,
                  }}
                />
              </div>
              <span style={barValue}>{activeUsers}</span>
            </div>

            <div style={barRow}>
              <span style={barLabel}>Locked Accounts</span>
              <div style={barTrack}>
                <div
                  style={{
                    ...barFill,
                    width: `${Math.max(lockedAccounts * 25, 8)}%`,
                  }}
                />
              </div>
              <span style={barValue}>{lockedAccounts}</span>
            </div>

            <div style={barRow}>
              <span style={barLabel}>Disabled Accounts</span>
              <div style={barTrack}>
                <div
                  style={{
                    ...barFill,
                    width: `${Math.max(disabledUsers * 25, 8)}%`,
                  }}
                />
              </div>
              <span style={barValue}>{disabledUsers}</span>
            </div>
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={sectionHeader}>
          <h2>Audit Log</h2>

          <div style={buttonGroup}>
            <button onClick={exportAuditLogs} style={primaryBtn}>
              Export Audit Log
            </button>

            <button onClick={resetDemoData} style={secondaryBtn}>
              Reset Demo Data
            </button>
          </div>
        </div>

        <table style={table}>
          <thead>
            <tr>
              <th style={thStyle}>Timestamp</th>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {auditLogs.map((log, index) => (
              <tr key={index}>
                <td style={tdStyle}>{log.timestamp}</td>
                <td style={tdStyle}>{log.user}</td>
                <td style={tdStyle}>{log.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <button onClick={logout} style={logoutBtn}>
        Logout
      </button>
    </div>
  );
}

const page = {
  padding: "24px",
  color: "white",
};

const subtitle = {
  color: "#cbd5e1",
  marginBottom: "24px",
};

const cardContainer = {
  display: "flex",
  flexWrap: "wrap",
  gap: "20px",
  marginBottom: "30px",
};

const card = {
  background: "#1e293b",
  padding: "20px",
  borderRadius: "12px",
  minWidth: "180px",
  border: "1px solid #334155",
};

const metric = {
  fontSize: "28px",
  fontWeight: "bold",
  marginTop: "8px",
};

const section = {
  marginTop: "30px",
};

const sectionHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
};

const buttonGroup = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const form = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
  marginTop: "12px",
};

const input = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #334155",
  backgroundColor: "#0f172a",
  color: "white",
};

const searchInput = {
  ...input,
  width: "260px",
  marginTop: "8px",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "12px",
  marginBottom: "30px",
};

const thStyle = {
  border: "1px solid #334155",
  padding: "12px",
  textAlign: "left",
  backgroundColor: "#1e293b",
};

const tdStyle = {
  border: "1px solid #334155",
  padding: "12px",
};

const activeBadge = {
  backgroundColor: "#064e3b",
  color: "#bbf7d0",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
};

const warningBadge = {
  backgroundColor: "#78350f",
  color: "#fde68a",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
};

const lockedBadge = {
  backgroundColor: "#7f1d1d",
  color: "#fecaca",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
};

const disabledBadge = {
  backgroundColor: "#374151",
  color: "#e5e7eb",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
};

const smallBtn = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
};

const primaryBtn = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
};

const secondaryBtn = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "1px solid #334155",
  cursor: "pointer",
  fontWeight: "bold",
  backgroundColor: "#0f172a",
  color: "white",
};

const protectedText = {
  color: "#94a3b8",
  fontSize: "13px",
};

const breakdownGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: "16px",
  marginTop: "12px",
};

const breakdownCard = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "12px",
  padding: "16px",
  minWidth: "220px",
};

const breakdownMetric = {
  fontSize: "24px",
  fontWeight: "bold",
  marginTop: "8px",
};

const noticeBox = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "12px",
  padding: "16px",
  marginTop: "12px",
};

const recommendationItem = {
  margin: "8px 0",
};

const chartGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "18px",
  marginTop: "12px",
};

const chartCard = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "12px",
  padding: "16px",
};

const barRow = {
  display: "grid",
  gridTemplateColumns: "160px 1fr 40px",
  alignItems: "center",
  gap: "10px",
  marginTop: "12px",
};

const barLabel = {
  color: "#cbd5e1",
};

const barTrack = {
  height: "12px",
  borderRadius: "999px",
  backgroundColor: "#0f172a",
  overflow: "hidden",
};

const barFill = {
  height: "100%",
  borderRadius: "999px",
  background: "linear-gradient(90deg, #2563eb, #06b6d4)",
};

const barValue = {
  textAlign: "right",
  color: "#cbd5e1",
};

const logoutBtn = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
};