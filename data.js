var H = require ('highland');
var request = require ('request');
var JSONStream = require('JSONStream');
var pitsToGeoJSON = require ('pits-to-geojson');
var fieldOfView = require ('field-of-view');

var geojson = {
  open: '{"type":"FeatureCollection","features":[',
  close: ']}\n'
};

module.exports = function(url) {
  var stream = request(url)
    .pipe(pitsToGeoJSON())
    .pipe(fieldOfView.fromStream({
      nested: 'data',
      angle: 140
    }));

  return stream
    .pipe(JSONStream.stringify(geojson.open, ',', geojson.close));
}
