// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db=require('./db');// database



const app = express();
const PORT = 5000;
//middleware
app.use(cors());// to enable CORS
app.use(express.json());
app.use(bodyParser.json());// to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // for form submissions


const usersRoutes = require("./routes/users");
app.use("/api/users", usersRoutes);



const patientRoutes = require('./routes/patient');
app.use('/api/patients', patientRoutes);

const visitRoutes = require('./routes/visit');
app.use('/api/visits', visitRoutes);

const diagnosisRoutes = require('./routes/diagnosis'); // ✅ ADD THIS
app.use('/api/diagnosis', diagnosisRoutes); 

const recordRoutes = require('./routes/record');
app.use('/api/records', recordRoutes);


app.use('/api/doctor',recordRoutes);

// Use login route
const loginRoutes = require('./routes/login'); // ✅ This line was missing
app.use('/api', loginRoutes); 

const path = require('path');
app.use('/client', express.static(path.join(__dirname, '..', 'client')));

// Serve static files from the client directory
const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);


app.get('/', (req, res) => {
    res.send('Server is running!');
});

//Testing db connection

db.query('SELECT 1', (err, result) => {
    if (err) {
        console.error('❌ DB connection failed:', err);
    } else {
        console.log('✅ DB connection successful!');
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});


