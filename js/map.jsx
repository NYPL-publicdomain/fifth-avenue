var React = require('react');
var tweenState = require('react-tween-state');

var mapboxgl = require('mapbox-gl');
var pointOnLine = require('turf-point-on-line');

module.exports = React.createClass({
  mixins: [tweenState.Mixin],

  getInitialState: function() {
    return {
      radiusMin: 75,
      radiusMax: 150,
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
        zoom: 15,
        bearing: -61.07,
        //pitch: 30,
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

    return (
      <section id='map-container' onMouseOver={this.onMouseOver}>
        <div id='map-wrapper' style={mapWrapperStyle}>
          <svg id='circles' style={circlesStyle} xmlns='http://www.w3.org/2000/svg' >
            <defs>
              <clipPath id='clipping-circle'>
                <circle cx={minWidthPx} cy={minWidthPx} r={minRadiusPx} />
              </clipPath>
            </defs>
            <circle cx={minWidthPx} cy={minWidthPx} r={minRadiusPx} />
          </svg>
          <div id='map' />
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

  onMouseOver: function() {
    console.log('HONDEN')
    this.tweenState('radiusMin', {
      easing: tweenState.easingTypes.easeInOutQuad,
      duration: 500,
      endValue: this.state.radiusMax
    });
  },



  setItem: function(item) {
    if (this.state.map) {

      var point = {
        type: 'Feature',
        geometry: item.feature.geometry.geometries[0]
      };
      var pointOnFifthAvenue = pointOnLine(this.state.fifthAvenue, point);

      var direction = item.feature.properties.direction;
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