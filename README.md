# swat-db

CouchDB interface for SWAT based applications

"Making nano easier to use in the real world." - eml

## In A Nut Shell:

```javascript
const { db, ensureDB, ensureView, upsert } = require('swat-db');

const nano = db('http://user:pass@localhost:5984');

ensureDB(nano, 'app-data', { partitioned: true }).then(async appDB => {
  let type;
  type = 'WIDGET';
  await ensureViews(
    appDB,
    type,
    {
      'by-name': {
        map: `({type,name}) => type === '${type}' && name && emit(name.trim().toUpperCase(),name)`,
        reduce: '_count',
      },
      'by-tag': {
        map: `({type,tags}) => type === '${type}' && tags && tags.forEach(tag => emit(tag,1))`,
        reduce: '_count',
      },
    },
    { partitioned: true }
  ).then(msg => console.log(`/widgets/_design/WIDGET: ${msg}`));

  // make sure the foo WIDGET exists...
  await upsert(appDB, {
    _id: 'WIDGET:foo',
    type: 'WIDGET',
    name: 'foo',
    tags: ['fast', 'easy', 'cheap'],
  })
    .then(({ id, rev }) =>
      console.log(`${id} ${rev.match(/^1-/) ? 'created' : 'updated'}`)
    )
    .catch(console.error);
});
```
