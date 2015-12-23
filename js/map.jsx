var React = require('react');

var mapboxgl = require('mapbox-gl');
var pointOnLine = require('turf-point-on-line');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      enlarge: false,
      borderWidth: 3,
      radiusMin: 75,
      radiusMax: 150,
      triangles: {
        type: 'FeatureCollection',
        features: this.props.fieldsOfView.features.map(function(feature) {
          return {
            type: 'Feature',
            properties: {
              uuid: feature.properties.id
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
        zoom: 15,
        bearing: -61.07
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
    var minWidth = this.state.radiusMin * 2;
    var maxWidth = this.state.radiusMax * 2;

    var circlesStyle = {
      height: `${maxWidth}px`
    };

    var mapWrapperStyle = {
      width: `${maxWidth}px`,
      height: `${maxWidth}px`,
      marginTop: `-${maxWidth / 2}px`
    };

    var minWidthPx = `${minWidth}px`;
    var minRadiusPx = `${minWidth / 2}px`;

    var className = this.state.enlarge ? 'enlarge' : '';

    return (
      <section id='map-container'>
        <div id='map-wrapper' style={mapWrapperStyle} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
          <div id='map-border' className={className} />
          <div id='map' className={className + ' mapboxgl-map'}/>
        </div>
      </section>
    );
  },

  componentDidMount: function() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYmVydHNwYWFuIiwiYSI6ImR3dERiQk0ifQ.DLbScmbRohc3Sqv7prfhqw';

    // var styleUrl = 'mapbox://styles/bertspaan/cih58g664001k9sm5pxoyfji9';
    var styleUrl = 'https://api.mapbox.com/styles/v1/bertspaan/cih58g664001k9sm5pxoyfji9?access_token='+ mapboxgl.accessToken;
    // TODO: DO NOT GET JSON!
    mapboxgl.util.getJSON(styleUrl, (err, stylesheet) => {
      var mapStyle = {
        container: 'map',
        attributionControl: false,
        style: stylesheet
      };

      var map = new mapboxgl.Map(Object.assign({}, this.state.flyTo, mapStyle));
      map.dragRotate.disable();

      map.on('click', this.onClick);
      map.on('mousemove', this.onMousemove);
      map.on('style.load', this.onStyleLoad);

      this.setState({
        map: map
      });
    });
  },

  setItem: function(item) {
    if (this.state.map) {

      var point = {
        type: 'Feature',
        geometry: item.feature.geometry.geometries[0]
      };
      var pointOnFifthAvenue = pointOnLine(this.state.fifthAvenue, point);

      var direction = item.feature.properties.data.direction;
      var bearing = this.state.flyTo.bearing; // + ((direction === 'east') ? 180 : 0);

      this.state.map.flyTo(Object.assign({}, this.state.flyTo, {
        center: pointOnFifthAvenue.geometry.coordinates,
        bearing: bearing
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
      paint: {
        'fill-color': '#61615f',
        'fill-opacity': 0.8
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
        'fill-color': '#007ad8',
        // 'fill-opacity': 0.8
        //'line-color': '#d8b92f',
        //'line-width': 3
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

  onMouseEnter: function() {
    this.setState({
      enlarge: true
    });
  },

  onMouseLeave: function() {
    this.setState({
      enlarge: false
    });
  },

  onMousemove: function(e) {
    var map = this.state.map;

    map.featuresAt(e.point, {layer: 'triangles', radius: 0}, function (err, features) {
      if (err) throw err;
        map.getCanvas().style.cursor = features.length ? 'pointer' : '';
    });
  }

});
