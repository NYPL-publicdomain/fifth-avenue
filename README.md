# Street View, Then & Now: New York City's Fifth Avenue

__The visualization can be found here: http://publicdomain.nypl.org/fifth-avenue/__

A [public domain remix](http://publicdomain.nypl.org) by [Bert Spaan](https://twitter.com/bertspaan) of [NYPL Labs](http://labs.nypl.org), using the [Fifth Avenue from Start to Finish collection](http://digitalcollections.nypl.org/collections/fifth-avenue-new-york-from-start-to-finish#/?tab=about) from 1911.

This visualization lets you compare the photos from this collection with
2015's [Google Street View](https://www.google.nl/maps/@40.7528429,-73.9813567,3a,75y,299.2h,96.54t/data=!3m6!1e1!3m4!1sFR-Gcj5IDRGxJ72fhcikWw!2e0!7i13312!8i6656).

![](photos/74db14a0-c6ca-012f-8de3-58d385a7bc34.jpg)
![](img/street-view.jpg)

## Data

Data comes from the [Space/Time Directory](http://spacetime.nypl.org/) Digital Collections dataset, in [Histograph](https://github.com/histograph/histograph)'s NDJSON format:

- https://github.com/nypl-spacetime/data/blob/master/digital-collections/digital-collections.pits.ndjson

This dataset contains photo UUIDs, and additional information about the photo's location and [field of view](https://en.wikipedia.org/wiki/Field_of_view):

```json
{
	"id": "678a75d0-c6ca-012f-037f-58d385a7bc34",
	"type": "st:Photo",
	"data": {
		"imageId": "1113225",
		"direction": "west",
		"bearing": 298,
		"distance": 19
	},
	"geometry": {
		"type": "Point",
		"coordinates": [-73.996396, 40.732277]
	},
	"validSince": 1911,
	"validUntil": 1911
}
```

With Space/Time's [field-of-view](https://github.com/nypl-spacetime/field-of-view) module, we can convert this dataset to a GeoJSON file containing [field of view geometries](data/fields-of-view.json):

[![](img/field-of-view.png)](data/fields-of-view.json)
