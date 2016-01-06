var React = require('react');

var mapboxgl = require('mapbox-gl');
var pointOnLine = require('turf-point-on-line');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      enlarge: false,
      borderWidth: 3,
      headerHeight: 35,
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
    var radiusMin = this.props.radius;
    var radiusMax = radiusMin * 2;

    var headerHeight = this.state.headerHeight;
    var minWidth = radiusMin * 2;
    var maxWidth = radiusMax * 2;

    var mapWrapperStyle = {
      width: `${maxWidth}px`,
      height: `${maxWidth}px`,
      marginTop: `-${maxWidth / 2 - headerHeight / 2}px`
    };

    var minWidthPx = `${minWidth}px`;
    var minRadiusPx = `${minWidth / 2}px`;

    var borderRadius = this.state.enlarge ? radiusMax : radiusMin;
    var mapRadius = borderRadius - this.state.borderWidth;

    var mapStyle = {
      WebkitClipPath: `circle(${mapRadius}px at center)`,
      clipPath: `circle(${mapRadius}px at center)`
    };

    var mapBorderStyle = {
      WebkitClipPath: `circle(${borderRadius}px at center)`,
      clipPath: `circle(${borderRadius}px at center)`
    };

    return (
      <section id='map-container'>
        <div id='map-wrapper' style={mapWrapperStyle}>
          <div id='map-border'  style={mapBorderStyle}/>
          <div id='map' className='mapboxgl-map' style={mapStyle} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}/>
        </div>
      </section>
    );
  },

  componentDidMount: function() {
    mapboxgl.accessToken = 'pk.eyJ1IjoibnlwbGxhYnMiLCJhIjoiY2lqMjBzdmRnMDBkbnRvbHpxNjJqcXV4bCJ9.6PmQSsjQT8zCgbOnZKCFdg';

    var mapStyle = {
      container: 'map',
      attributionControl: false,
      style: 'mapbox://styles/nypllabs/cij200za6003e8ykq2tsgjpd0'
    };

    var map = new mapboxgl.Map(Object.assign({}, this.state.flyTo, mapStyle));
    map.dragRotate.disable();

    map.on('click', this.onClick);
    map.on('mousemove', this.onMousemove);
    map.on('style.load', this.onStyleLoad);

    this.setState({
      map: map
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
        'fill-color': '#c02026',
        // 'fill-opacity': 0.8
        'line-color': '#d8b92f',
        'line-width': 30
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
