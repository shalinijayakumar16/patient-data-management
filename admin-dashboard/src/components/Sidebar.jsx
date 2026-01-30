import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div style={styles.sidebar}>
      <h2>Admin</h2>

      <Link style={styles.link} to="/">Dashboard</Link>
      <Link style={styles.link} to="/users">Users</Link>
      <Link style={styles.link} to="/patients">Patients</Link>
      <Link style={styles.link} to="/appointments">Appointments</Link>
      <Link style={styles.link} to="/reports">Reports</Link>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    height: "100vh",
    background: "#f4f4f4ff",
    color: "black",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  link: {
    color: "black",
    textDecoration: "none",
  },
};

export default Sidebar;
