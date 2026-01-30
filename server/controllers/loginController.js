const db = require('../db');

exports.login = (req, res) => {
  const { user_id, password } = req.body;

  console.log("🔐 Login attempt:", { user_id, password });

  if (!user_id || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const trimmedId = user_id.trim().toLowerCase(); // trim + force lowercase

  const query = 'SELECT * FROM users WHERE LOWER(user_id) = ?';
  db.query(query, [trimmedId], (err, results) => {
    console.log("📄 SQL Query:", query);
    console.log("📌 Param:", trimmedId);
    console.log("📦 DB Results:", results);

    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid user ID' });
    }

    const user = results[0];

    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const loginTime = new Date();
    db.query('UPDATE users SET login_time = ? WHERE id = ?', [loginTime, user.id]);

    let redirect = '';
    if (user.role === 'doctor') redirect = '/client/doctor/dashboard.html';
    else if (user.role === 'nurse') redirect = '/client/nurse/dashboard.html';
    else if (user.role === 'receptionist') redirect = '/client/receptionist/dashboard.html';
    else return res.status(403).json({ error: 'Unknown role' });

    return res.json({
      message: 'Login successful',
      role: user.role,
      redirect
    });
  });
};

exports.logout = (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID required' });
  }

  const logoutTime = new Date();
  const query = 'UPDATE users SET logout_time = ? WHERE user_id = ?';

  db.query(query, [logoutTime, user_id], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: 'Failed to record logout' });
    }

    return res.json({ message: 'Logout successful' });
  });
};
