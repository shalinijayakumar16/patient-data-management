import { useState } from "react";
import axios from "axios";

function Appointments() {
  const [patientId, setPatientId] = useState("");
  const [visits, setVisits] = useState([]);

  const fetchVisits = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/visits/${patientId}`
      );
      setVisits(res.data);
    } catch (err) {
      console.log("Visit fetch error:", err);
    }
  };

  return (
    <div>
      <h2>Patient Visits</h2>

      <input
        placeholder="Enter Patient ID"
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
        style={{ padding: "8px", marginRight: "10px" }}
      />

      <button onClick={fetchVisits}>Get Visits</button>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Visit ID</th>
            <th>Date</th>
            <th>Reason</th>
            <th>Doctor</th>
          </tr>
        </thead>

        <tbody>
          {visits.map((v, index) => (
            <tr key={index}>
              <td>{v.visit_id}</td>
              <td>{v.date}</td>
              <td>{v.reason}</td>
              <td>{v.doctor_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  table: {
    width: "100%",
    marginTop: "20px",
    background: "white",
    borderCollapse: "collapse",
  },
};

export default Appointments;
