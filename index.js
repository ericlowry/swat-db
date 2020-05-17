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

//
// ensureDB(db, name, opts) - make sure a db collection exists
//
//
function ensureDB(nano, name, opts = { partitioned: false }) {
  return nano.db
    .create(name, opts)
    .then(() => {
      // collection created!
      return nano.use(name);
    })
    .catch(err => {
      if (err.statusCode !== 412) throw err; // re-throw the unexpected error
      const db = nano.use(name);
      return db.info().then(({ props }) => {
        if (opts.partitioned && !props.partitioned)
          throw `db '${name}' exists but is NOT partitioned`;
        if (!opts.partitioned && props.partitioned)
          throw `db '${name}' exists but is partitioned`;
        return db;
      });
    });
}

module.exports = {
  db,
  dbUrl,
  dbName,
  dbOrigin,
  ensureDB,
};
