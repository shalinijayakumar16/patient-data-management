import { useEffect, useState } from "react";
import axios from "axios";

import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [dayCount, setDayCount] = useState(0);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [seniorCount, setSeniorCount] = useState(0);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterByDate();
  }, [selectedDate, patients]);

  const fetchPatients = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/patients");
      setPatients(res.data);
      setDayCount(res.data.length);
      calculateStats(res.data);
    } catch (err) {
      console.log("Patient API error:", err);
    }
  };

  const calculateStats = (data) => {
    setMaleCount(data.filter((p) => p.gender?.toLowerCase() === "male").length);
    setFemaleCount(data.filter((p) => p.gender?.toLowerCase() === "female").length);
    setSeniorCount(data.filter((p) => Number(p.age) > 60).length);
  };

  const filterByDate = () => {
    if (!selectedDate) return setDayCount(patients.length);

    const count = patients.filter((p) => {
      const d = new Date(p.created_at).toISOString().split("T")[0];
      return d === selectedDate;
    }).length;

    setDayCount(count);
  };

  // ================= CSV =================
  const downloadCSV = () => {
    if (!patients.length) return;
    const headers = Object.keys(patients[0]).join(",");
    const rows = patients.map((p) =>
      Object.values(p).map((v) => `"${v}"`).join(",")
    );
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "patients.csv";
    link.click();
  };

  // ================= WEEKLY =================
  const getLast7DaysData = () => {
    const counts = {};
    const labels = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      labels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
      counts[key] = 0;
    }

    patients.forEach((p) => {
      const d = new Date(p.created_at).toISOString().split("T")[0];
      if (counts[d] !== undefined) counts[d]++;
    });

    return { labels, data: Object.values(counts) };
  };

  const barInfo = getLast7DaysData();

  const barChartData = {
    labels: barInfo.labels,
    datasets: [
      {
        label: "Patients",
        data: barInfo.data,
        backgroundColor: "#14b8a6",
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  // ================= PIE =================
  const pieChartData = {
    labels: ["Male", "Female"],
    datasets: [
      {
        data: [maleCount, femaleCount],
        backgroundColor: ["#0ea5e9", "#ec4899"],
      },
    ],
  };

  const pieOptions = { maintainAspectRatio: false };

  // ================= MONTHLY =================
  const getMonthlyData = () => {
    const counts = {};
    const labels = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      labels.push(d.toLocaleString("en-US", { month: "short" }));
      counts[key] = 0;
    }

    patients.forEach((p) => {
      const d = new Date(p.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (counts[key] !== undefined) counts[key]++;
    });

    return { labels, data: Object.values(counts) };
  };

  const monthlyInfo = getMonthlyData();

  const lineChartData = {
    labels: monthlyInfo.labels,
    datasets: [
      {
        label: "Patients",
        data: monthlyInfo.data,
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.15)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineOptions = { maintainAspectRatio: false };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Patient Dashboard</h2>

        <div style={styles.topBar}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
          <button onClick={downloadCSV} style={styles.btn}>
            Export CSV
          </button>
        </div>

        {/* ================= CARDS ================= */}
        <div style={styles.cardGrid}>
          <StatCard title="Today's Patients" value={dayCount} />
          <StatCard title="Total Patients" value={patients.length} />
          <StatCard title="Male Patients" value={maleCount} />
          <StatCard title="Female Patients" value={femaleCount} />
          <StatCard title="Senior (60+)" value={seniorCount} />
        </div>

        {/* ================= CHARTS ================= */}
        <div style={styles.chartGrid}>
          <div style={styles.chartCard}>
            <h4 style={styles.chartTitle}>Weekly Registration</h4>
            <div style={{ flex: 1 }}>
              <Bar data={barChartData} options={barOptions} />
            </div>
          </div>

          <div style={styles.chartCard}>
            <h4 style={styles.chartTitle}>Gender Distribution</h4>
            <div style={{ flex: 1 }}>
              <Pie data={pieChartData} options={pieOptions} />
            </div>
          </div>

          <div style={{ ...styles.chartCard, gridColumn: "1 / -1", height: "300px" }}>
            <h4 style={styles.chartTitle}>Monthly Trend</h4>
            <div style={{ flex: 1 }}>
              <Line data={lineChartData} options={lineOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardTitle}>{title}</p>
      <h2 style={styles.cardValue}>{value}</h2>
    </div>
  );
}

/* ================= CLEAN WHITE CLINIC UI ================= */
const styles = {
  page: {
    background: "#f4f6f8",
    minHeight: "100vh",
    padding: "24px",
    width: "100%",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: "100%",
  },

  title: {
    fontSize: "26px",
    marginBottom: "12px",
    color: "#111",
  },

  topBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },

  dateInput: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  btn: {
    background: "#14b8a6",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "30px",
  },

  card: {
    background: "white",
    padding: "16px",
    borderRadius: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },

  cardTitle: {
    fontSize: "14px",
    color: "#555",
  },

  cardValue: {
    fontSize: "26px",
    marginTop: "6px",
    color: "#111",
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  chartCard: {
    background: "white",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    height: "320px",
    display: "flex",
    flexDirection: "column",
  },

  chartTitle: {
    marginBottom: "10px",
    color: "#111",
  },
};

export default Dashboard;
