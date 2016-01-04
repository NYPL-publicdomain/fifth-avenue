var data = require('./data');

var url = 'https://raw.githubusercontent.com/nypl-spacetime/data/master/digital-collections/digital-collections.pits.ndjson';

data(url)
  .pipe(process.stdout);
