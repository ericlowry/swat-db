//
// swat-db - common db routines for SWAT based applications
//

const assert = require('assert');
const nano = require('nano');

//
// dbUrl(url, {userName, password, dbName}) - construct a couchdb url
//
function dbUrl(url, override = {}) {
  assert(url && typeof url === 'string');
  const { protocol, username, password, host, pathname } = new URL(url);
  return (
    protocol +
    '//' +
    (override.userName || username) +
    ':' +
    (override.password || password) +
    '@' +
    host +
    (override.dbName ? `/${override.dbName}` : pathname)
  );
}

//
// db(host, {userName, password, dbName})
//
// Note: options take precedence over host URL settings
//
function db(url, override) {
  return nano(dbUrl(url, override));
}

//
// dbName(db) - return the collection name of the db
//
function dbName(db) {
  return db.config.db;
}

//
// dbOrigin(db) - return a log file safe db url (no user/password)
//
function dbOrigin(db) {
  const { origin } = new URL(db.config.url);
  return `${origin}/${db.config.db}`;
}

module.exports = {
  db,
  dbUrl,
  dbName,
  dbOrigin,
};
