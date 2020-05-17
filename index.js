//
// swat-db - common db routines for SWAT based applications
//

const url = require('url');
const nano = require('nano');

//
// db(host, {user, password, path})
//
// Note: opts tale precedence over host URL
//
function db(host, opts) {
  const { protocol: dbProtocol, host: dbHost, auth, path } = host;

  const dbAuth =
    opts.user && opts.password
      ? `${opts.user}:${opts.password}@`
      : auth
      ? `${auth}@`
      : '';

  const dbPath = opts.path ? `/${opts.path}` : path;

  const url = dbProtocol + dbAuth + dbHost + dbPath;

  return nano(url);
}

module.exports = {
  db,
};
