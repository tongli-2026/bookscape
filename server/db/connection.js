const { Pool, types } = require("pg");
const config = require("../config");

types.setTypeParser(20, (val) => parseInt(val, 10));

const connection = new Pool({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
  ssl: {
    rejectUnauthorized: false,
  },
});

connection.connect((err) => err && console.log(err));

module.exports = connection;
