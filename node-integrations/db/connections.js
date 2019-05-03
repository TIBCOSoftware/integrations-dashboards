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

connections.initSandbox = () => {
  return connections.init({
    host: process.env.SANDBOX_DB_HOST,
    user: process.env.SANDBOX_DB_USER,
    password: process.env.SANDBOX_DB_PASS,
    database: process.env.SANDBOX_DB_DATABASE
  });
};

connections.initProduction = () => {
  return connections.init({
    host: process.env.PRODUCTION_DB_HOST,
    user: process.env.PRODUCTION_DB_USER,
    password: process.env.PRODUCTION_DB_PASS,
    database: process.env.PRODUCTION_DB_DATABASE
  });
};

module.exports = connections;
