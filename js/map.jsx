var React = require('react');

var mapboxgl = require('mapbox-gl');
var pointOnLine = require('turf-point-on-line');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      triangles: {
        type: 'FeatureCollection',
        features: this.props.fieldsOfView.features.map(function(feature) {
          return {
            type: 'Feature',
            properties: {
              uuid: feature.properties.uuid
            },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                feature.geometry.geometries[0].coordinates,
                feature.geometry.geometries[1].coordinates[0],
                feature.geometry.geometries[1].coordinates[1],
                feature.geometry.geometries[0].coordinates
              ]]
            }
          };
        })
      },
      flyTo: {
        center: [
          -73.9821,
          40.7520
        ],
        zoom: 16,
        bearing: -61.06,
        pitch: 30,
      },
      fifthAvenue: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [
              -73.94455969333649,
              40.80324428776881
            ],
            [
              -73.99704515933989,
              40.731283277680916
            ]
          ]
        }
      }
    };
  },

  render: function() {
    return (
      <section id='map' />
    );
  },

  componentDidMount: function() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYmVydHNwYWFuIiwiYSI6ImR3dERiQk0ifQ.DLbScmbRohc3Sqv7prfhqw';
    var map = new mapboxgl.Map(Object.assign(this.state.flyTo, {
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v8'
      // style: 'mapbox://styles/mapbox/satellite-v8',
    }));

    map.dragRotate.disable();

    map.on('click', this.onClick);
    map.on('mousemove', this.onMousemove);
    map.on('style.load', this.onStyleLoad);

    this.setState({
      map: map
    })
  },

  setItem: function(item) {
    if (this.state.map) {

      var point = {
        type: 'Feature',
        geometry: item.feature.geometry.geometries[0]
      };
      var pointOnFifthAvenue = pointOnLine(this.state.fifthAvenue, point);

      this.state.map.flyTo(Object.assign(this.state.flyTo, {
        center: pointOnFifthAvenue.geometry.coordinates
      }));

      var triangle = this.state.triangles.features[item.index];
      this.state.sources.selectedTriangle.setData(triangle);
    }
  },

  onStyleLoad: function() {
    var map = this.state.map;

    var sources = {
      triangles: new mapboxgl.GeoJSONSource({
        data: this.state.triangles
      }),
      selectedTriangle: new mapboxgl.GeoJSONSource({
        data: {
          type: 'FeatureCollection',
          features: []
        }
      })
    };

    map.addSource('triangles', sources.triangles);
    map.addSource('selected-triangle', sources.selectedTriangle);

    map.addLayer({
      id: 'triangles',
      source: 'triangles',
      interactive: true,
      type: 'fill',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'fill-color': '#088',
        'fill-opacity': 0.8,
        'line-color': '#888',
        'line-width': 3
      }
    });

    map.addLayer({
      id: 'selected-triangle',
      source: 'selected-triangle',
      interactive: true,
      type: 'fill',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'fill-color': '#f00',
        'fill-opacity': 0.8,
        'line-color': '#f00',
        'line-width': 3
      }
    });

    this.setState({
      sources: sources
    });

    this.setItem(this.props.currentItem);
  },

  onClick: function(e) {
    this.state.map.featuresAt(e.point, {layer: 'triangles', radius: 0}, function(err, features) {
      if (features.length) {
        var uuid = features[0].properties.uuid;
        this.props.setUuid(uuid);
      }
    }.bind(this));
  },

  onMousemove: function(e) {
    var map = this.state.map;

    map.featuresAt(e.point, {layer: 'triangles', radius: 0}, function (err, features) {
      if (err) throw err;
        map.getCanvas().style.cursor = features.length ? 'pointer' : '';
    });
  }

});
