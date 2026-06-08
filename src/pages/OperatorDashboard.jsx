import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function OperatorDashboard() {
  const { logout } = useAuth();

  const [alerts, setAlerts] = useState(() => {
    const savedAlerts = localStorage.getItem("secureaccess-operator-alerts");

    return savedAlerts
      ? JSON.parse(savedAlerts)
      : [
          {
            severity: "High",
            event: "Multiple Failed Login Attempts",
            target: "jdoe",
            status: "Open",
          },
          {
            severity: "Medium",
            event: "Password Reset Request",
            target: "admin",
            status: "Open",
          },
          {
            severity: "Low",
            event: "New Session Started",
            target: "operator",
            status: "Open",
          },
        ];
  });

  const [activityLog, setActivityLog] = useState(() => {
    const savedActivity = localStorage.getItem("secureaccess-operator-activity");

    return savedActivity
      ? JSON.parse(savedActivity)
      : [
          {
            time: "10:15 PM",
            activity: "Failed login detected",
          },
          {
            time: "10:22 PM",
            activity: "Account lockout triggered",
          },
          {
            time: "10:35 PM",
            activity: "Password reset requested",
          },
        ];
  });

  const failedLogins = 17;
  const activeSessions = 8;

  const openAlerts = alerts.filter((alert) => alert.status === "Open").length;
  const resolvedAlerts = alerts.filter(
    (alert) => alert.status === "Resolved"
  ).length;

  const highAlerts = alerts.filter((alert) => alert.severity === "High").length;
  const mediumAlerts = alerts.filter(
    (alert) => alert.severity === "Medium"
  ).length;
  const lowAlerts = alerts.filter((alert) => alert.severity === "Low").length;

  const monitoringHealthScore = Math.max(
    0,
    100 - openAlerts * 10 - highAlerts * 8 - Math.floor(failedLogins / 3)
  );

  const healthLevel =
    monitoringHealthScore >= 90
      ? "Stable"
      : monitoringHealthScore >= 70
      ? "Watch"
      : "Attention Needed";

  const recommendations = [
    openAlerts > 0
      ? "Review and resolve open alerts before session end."
      : "No open alerts require action.",
    highAlerts > 0
      ? "Prioritize high-severity authentication alerts."
      : "No high-severity alerts are currently open.",
    failedLogins >= 10
      ? "Escalate repeated login failures to an administrator."
      : "Failed login volume is within normal monitoring range.",
    "Operators should not modify users, roles, permissions, or account status.",
  ];

  const eventTrend = [
    { label: "Failed Logins", value: failedLogins },
    { label: "Open Alerts", value: openAlerts },
    { label: "Resolved Alerts", value: resolvedAlerts },
    { label: "Active Sessions", value: activeSessions },
  ];

  const severityBreakdown = [
    { label: "High", value: highAlerts },
    { label: "Medium", value: mediumAlerts },
    { label: "Low", value: lowAlerts },
  ];

  const sessionActivity = [
    {
      user: "operator",
      lastLogin: "Current Session",
      status: "Active",
      accessLevel: "Monitoring Only",
    },
    {
      user: "admin",
      lastLogin: "11:45 PM",
      status: "Active",
      accessLevel: "Privileged",
    },
    {
      user: "jdoe",
      lastLogin: "10:15 PM",
      status: "Flagged",
      accessLevel: "Restricted",
    },
  ];

  useEffect(() => {
    localStorage.setItem("secureaccess-operator-alerts", JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(
      "secureaccess-operator-activity",
      JSON.stringify(activityLog)
    );
  }, [activityLog]);

  function getCurrentTime() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleResolveAlert(index) {
    const selectedAlert = alerts[index];

    setAlerts((previousAlerts) =>
      previousAlerts.map((alert, alertIndex) =>
        alertIndex === index ? { ...alert, status: "Resolved" } : alert
      )
    );

    setActivityLog((previousActivity) => [
      {
        time: getCurrentTime(),
        activity: `Resolved alert: ${selectedAlert.event} for ${selectedAlert.target}`,
      },
      ...previousActivity,
    ]);
  }

  function resetOperatorDemoData() {
    const defaultAlerts = [
      {
        severity: "High",
        event: "Multiple Failed Login Attempts",
        target: "jdoe",
        status: "Open",
      },
      {
        severity: "Medium",
        event: "Password Reset Request",
        target: "admin",
        status: "Open",
      },
      {
        severity: "Low",
        event: "New Session Started",
        target: "operator",
        status: "Open",
      },
    ];

    const defaultActivity = [
      {
        time: "10:15 PM",
        activity: "Failed login detected",
      },
      {
        time: "10:22 PM",
        activity: "Account lockout triggered",
      },
      {
        time: "10:35 PM",
        activity: "Password reset requested",
      },
    ];

    setAlerts(defaultAlerts);
    setActivityLog(defaultActivity);

    localStorage.setItem(
      "secureaccess-operator-alerts",
      JSON.stringify(defaultAlerts)
    );
    localStorage.setItem(
      "secureaccess-operator-activity",
      JSON.stringify(defaultActivity)
    );
  }

  return (
    <div style={page}>
      <h1>Operator Security Dashboard</h1>

      <p style={subtitle}>
        Restricted monitoring view for security operations personnel.
      </p>

      <div style={cardContainer}>
        <div style={card}>
          <h3>Active Sessions</h3>
          <p style={metric}>{activeSessions}</p>
        </div>

        <div style={card}>
          <h3>Open Alerts</h3>
          <p style={metric}>{openAlerts}</p>
        </div>

        <div style={card}>
          <h3>Resolved Alerts</h3>
          <p style={metric}>{resolvedAlerts}</p>
        </div>

        <div style={card}>
          <h3>Failed Logins</h3>
          <p style={metric}>{failedLogins}</p>
        </div>

        <div style={card}>
          <h3>Monitoring Health</h3>
          <p style={metric}>{monitoringHealthScore}/100</p>
          <span
            style={
              healthLevel === "Stable"
                ? lowBadge
                : healthLevel === "Watch"
                ? mediumBadge
                : highBadge
            }
          >
            {healthLevel}
          </span>
        </div>
      </div>

      <section style={section}>
        <h2>Monitoring Health Breakdown</h2>

        <div style={breakdownGrid}>
          <div style={breakdownCard}>
            <strong>Open Alert Penalty</strong>
            <p style={breakdownMetric}>-{openAlerts * 10}</p>
          </div>

          <div style={breakdownCard}>
            <strong>High-Severity Penalty</strong>
            <p style={breakdownMetric}>-{highAlerts * 8}</p>
          </div>

          <div style={breakdownCard}>
            <strong>Failed Login Penalty</strong>
            <p style={breakdownMetric}>-{Math.floor(failedLogins / 3)}</p>
          </div>
        </div>
      </section>

      <section style={section}>
        <h2>Operator Recommendations</h2>

        <div style={recommendationBox}>
          {recommendations.map((recommendation, index) => (
            <p key={index} style={recommendationItem}>
              • {recommendation}
            </p>
          ))}
        </div>
      </section>

      <section style={section}>
        <h2>Security Alerts</h2>

        <table style={table}>
          <thead>
            <tr>
              <th style={thStyle}>Severity</th>
              <th style={thStyle}>Event</th>
              <th style={thStyle}>Target</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {alerts.map((alert, index) => (
              <tr key={index}>
                <td style={tdStyle}>
                  <span
                    style={
                      alert.severity === "High"
                        ? highBadge
                        : alert.severity === "Medium"
                        ? mediumBadge
                        : lowBadge
                    }
                  >
                    {alert.severity}
                  </span>
                </td>

                <td style={tdStyle}>{alert.event}</td>
                <td style={tdStyle}>{alert.target}</td>

                <td style={tdStyle}>
                  <span
                    style={
                      alert.status === "Resolved" ? resolvedBadge : openBadge
                    }
                  >
                    {alert.status}
                  </span>
                </td>

                <td style={tdStyle}>
                  {alert.status === "Resolved" ? (
                    <span style={restrictedText}>No action needed</span>
                  ) : (
                    <button
                      style={smallBtn}
                      onClick={() => handleResolveAlert(index)}
                    >
                      Mark Resolved
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
              <th style={thStyle}>Last Login</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Access Level</th>
            </tr>
          </thead>

          <tbody>
            {sessionActivity.map((session, index) => (
              <tr key={index}>
                <td style={tdStyle}>{session.user}</td>
                <td style={tdStyle}>{session.lastLogin}</td>
                <td style={tdStyle}>
                  <span
                    style={
                      session.status === "Active"
                        ? lowBadge
                        : session.status === "Flagged"
                        ? highBadge
                        : mediumBadge
                    }
                  >
                    {session.status}
                  </span>
                </td>
                <td style={tdStyle}>{session.accessLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={section}>
        <h2>Security Trend Charts</h2>

        <div style={chartGrid}>
          <div style={chartCard}>
            <h3>Operational Event Volume</h3>

            {eventTrend.map((item, index) => (
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
            <h3>Alert Severity Mix</h3>

            {severityBreakdown.map((item, index) => (
              <div key={index} style={barRow}>
                <span style={barLabel}>{item.label}</span>
                <div style={barTrack}>
                  <div
                    style={{
                      ...barFill,
                      width: `${Math.max(item.value * 25, 8)}%`,
                    }}
                  />
                </div>
                <span style={barValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={sectionHeader}>
          <h2>Recent Activity</h2>

          <button onClick={resetOperatorDemoData} style={secondaryBtn}>
            Reset Operator Demo Data
          </button>
        </div>

        <table style={table}>
          <thead>
            <tr>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Activity</th>
            </tr>
          </thead>

          <tbody>
            {activityLog.map((item, index) => (
              <tr key={index}>
                <td style={tdStyle}>{item.time}</td>
                <td style={tdStyle}>{item.activity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div style={noticeBox}>
        <strong>Access Restrictions</strong>
        <p>
          Operators can review and resolve monitoring alerts, but they cannot
          create users, modify roles, disable accounts, unlock users, or change
          permission levels.
        </p>
      </div>

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
  gap: "20px",
  marginBottom: "30px",
  flexWrap: "wrap",
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

const recommendationBox = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "12px",
  padding: "16px",
  marginTop: "12px",
};

const recommendationItem = {
  margin: "8px 0",
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

const highBadge = {
  backgroundColor: "#7f1d1d",
  color: "#fecaca",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
};

const mediumBadge = {
  backgroundColor: "#78350f",
  color: "#fde68a",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
};

const lowBadge = {
  backgroundColor: "#064e3b",
  color: "#bbf7d0",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
};

const openBadge = {
  backgroundColor: "#1e3a8a",
  color: "#bfdbfe",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
};

const resolvedBadge = {
  backgroundColor: "#064e3b",
  color: "#bbf7d0",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
};

const restrictedText = {
  color: "#94a3b8",
  fontSize: "13px",
};

const smallBtn = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
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

const noticeBox = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "12px",
  padding: "16px",
  marginBottom: "20px",
};

const logoutBtn = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
};