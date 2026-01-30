import { useEffect, useState } from "react";
import axios from "axios";

function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [roleFilter, users]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.log("Users API error:", err);
    }
  };

  const applyFilter = () => {
    if (roleFilter === "all") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((u) => u.role === roleFilter);
      setFilteredUsers(filtered);
    }
  };

  return (
    <div>
      <h2>Users Management</h2>

      {/* Role Filter */}
      <div style={{ marginBottom: "15px" }}>
        <label>Filter by Role: </label>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="doctor">Doctor</option>
          <option value="nurse">Nurse</option>
          <option value="receptionist">Receptionist</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th>User ID</th>
<th>Role</th>
<th>Login</th>
<th>Status</th>

          </tr>
        </thead>
        <tbody>
  {filteredUsers.map((u) => (
    <tr key={u.id}>
      <td>{u.user_id}</td>
      <td>{u.role}</td>
      <td>{u.login_time ? "Logged In" : "—"}</td>
      <td>{u.logout_time ? "Logged Out" : "Active"}</td>
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
    borderCollapse: "collapse",
  },
};

export default Users;
