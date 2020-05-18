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

//
// async upsert( db, doc[, id] )
//
// attempts to insert a document, on document conflict, attempt to create a new version
//
const upsert = (db, doc, id) =>
  // attempt to insert the doucment "as is"
  db.insert(doc, id).catch(err => {
    // for anything other than a document conflict...
    if (err.statusCode !== 409)
      // ...re-throw the error.
      throw err;

    // get the document id from the parameter or the document itself
    const _id = id || doc._id;

    // use the head() function to grab the existing document's etag header
    return db
      .head(_id)
      .then(({ etag }) => {
        doc._id = _id;
        doc._rev = etag.replace(/"/g, ''); // strip extraneous '"'s
        return db.insert(doc);
      })
      .catch(err => {
        throw err; // unexpected error from db.head()
      });
  });

module.exports = {
  db,
  dbUrl,
  dbName,
  dbOrigin,
  ensureDB,
  upsert,
};
