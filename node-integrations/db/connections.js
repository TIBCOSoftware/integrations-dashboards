const mysql = require('promise-mysql');

const connections = {};

connections.init = credentials => {
  return mysql.createConnection({
    host: credentials.host,
    user: credentials.user,
    password: credentials.password,
    database: credentials.database
  });
};

connections.initFromEnv = () => {
  return connections.init({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
  });
};

module.exports = connections;
