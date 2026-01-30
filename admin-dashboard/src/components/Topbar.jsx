function Topbar() {
  return (
    <div style={styles.topbar}>
      <h3 style={styles.title}>Hospital Admin Dashboard</h3>
      <p style={styles.user}>Admin</p>
    </div>
  );
}

const styles = {
  topbar: {
    height: "60px",
    background: "#ffffff",
    color: "#111", // ✅ text color
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    borderBottom: "1px solid #e5e7eb",
    fontFamily: "Inter, system-ui, Arial, sans-serif",
  },

  title: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111",
  },

  user: {
    fontSize: "14px",
    color: "#374151",
  },
};

export default Topbar;
