const pgp = require("pg-promise")();

// Preparing the connection details:
const cn = process.env.DATABASE_URL;
console.log(cn);
const db = pgp(cn);

// Test the connection
db.connect()
  .then((obj) => {
    console.log(
      "Connected to the database:",
      obj.client.connectionParameters.database
    );
    obj.done(); // success, release the connection;
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

module.exports = db;
