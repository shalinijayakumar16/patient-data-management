import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";

function App() {
  return (
    <BrowserRouter>
      <div style={styles.app}>
        <Sidebar />

        <div style={styles.right}>
          <Topbar />

          <div style={styles.content}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/appointments" element={<Appointments />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  app: {
    display: "flex",
    width: "100vw",
    minHeight: "100vh",
    background: "#f4f6f8",
  },

  right: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0, // 🔥 important for charts & layout
  },

  content: {
    flex: 1,
    padding: "24px",
    background: "#f4f6f8",
  },
};

export default App;
