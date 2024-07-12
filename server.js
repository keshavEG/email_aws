const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const emailRoutes = require('./routes/emailRoutes');
const sql = require("mssql");

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

app.use(cors());
app.use(bodyParser.json());
app.use('/api', emailRoutes);

var config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    options: {
        encrypt: false // Disable encryption if not using SSL
    }
};

sql.connect(config, err => {
    if (err) {
        console.error("Error connecting to the database:", err);
        return;
    }
    console.log("Connection Successful!");
});

app.get("/", (request, response) => {
    const requestQuery = new sql.Request();
    requestQuery.query("SELECT TOP 100 * FROM Market_Inside_new.dbo.free_email_domain", (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            response.status(500).send(err);
        } else {
            response.send(result.recordset); // Send query result as response
            console.dir(result.recordset);
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
