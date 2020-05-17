//
// swat-db - common db routines for SWAT based applications
//

const url = require('url');
const nano = require('nano');

//
// db(host, {user, password, name})
//
// Note: options take precedence over host URL settings
//
function db(host, opts) {
  const { protocol: dbProtocol, host: dbHost, auth, name } = host;

  const dbAuth =
    opts.user && opts.password
      ? `${opts.user}:${opts.password}@`
      : auth
      ? `${auth}@`
      : '';

  const dbName = opts.name ? `/${opts.name}` : path;

  const url = dbProtocol + dbAuth + dbHost + dbName;

  return nano(url);
}

function dbName(db){
    return db.config.db;
}

module.exports = {
  db,
  dbName: db => db.config.db,
};
