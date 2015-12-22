var React = require('react');

var Photos = require('./photos');
var Map = require('./map');
var StreetView = require('./street-view');

var distance = require('turf-distance');

module.exports = React.createClass({

  getInitialState: function() {
    var fieldsOfView = {
      type: 'FeatureCollection',
      features: this.props.fieldsOfView.features.sort(function(a, b) {
        // Sort features south to north
        var pointA = a.geometry.geometries[0].coordinates;
        var pointB = b.geometry.geometries[0].coordinates;

        return pointA[1] - pointB[1];
      })
    };

    // Create linked list of north-to-south ordered photos
    var southToNorth = {};
    var length = fieldsOfView.features.length;
    fieldsOfView.features.forEach(function(feature, i) {
      southToNorth[feature.properties.id] = {
        uuid: feature.properties.id,
        index: i,
        north: (i < length - 1) ? fieldsOfView.features[i + 1] : null,
        south: (i > 0) ? fieldsOfView.features[i - 1] : null,
        feature: feature
      };
    });

    return {
      uuid: this.props.uuid,
      currentItem: southToNorth[this.props.uuid],
      fieldsOfView: fieldsOfView,
      southToNorth: southToNorth,
      getDirections: {
        south: this.getSouth,
        north: this.getNorth,
        across: this.getAcross
      },
      goDirections: {
        south: this.goSouth,
        north: this.goNorth,
        across: this.goAcross
      }
    };
  },

  render: function() {
    // <p>
    //   Fifth Avenue, the street that became the social and cultural spine of New York's elite, first appeared on the Commissioners&#39; Map of 1811. At that time, it was merely a country road to Yorkville (then just a tiny self-contained village), but in the proposed grid plan it would be a grand boulevard. As the City grew and prospered Fifth Avenue became synonymous with fashionable life, the site of mansions, cultural and social institutions, and restaurants and shops catering to the elite.
    // </p>
    // <img src='img/fifth-avenue.png' />
    // <p>
    //   In 1907, alarmed at the approach of factories, the leading merchants and residents formed the Fifth Avenue Association. The "Save New York Committee" became a bulwark against the wrong kind of development. Perhaps inspired by this contemporary movement, photographer Burton Welles used a wide-angled view camera in 1911 to document this most important street from Washington Square, north to East 93rd Street.
    // </p>

    return (
      <article>
        <section className='margin-top'>
          <img src='img/fifth-avenue.png' />
        </section>
        <Photos ref='photos' setUuid={this.setUuid} currentItem={this.state.currentItem} getDirections={this.state.getDirections} goDirections={this.state.goDirections} />
        <Map ref='map' setUuid={this.setUuid} currentItem={this.state.currentItem} fieldsOfView={this.state.fieldsOfView} />
        <StreetView currentItem={this.state.currentItem} />
      </article>
    );
  },

  componentDidMount: function() {
    document.onkeydown = this.onKeyDown;
  },

  setItem: function(item) {
    if (item) {
      this.setState({
        uuid: item.uuid,
        currentItem: item
      });

      this.refs.map.setItem(item);
    }
  },

  setUuid: function(uuid) {
    var item = this.state.southToNorth[uuid];
    this.setItem(item);
  },

  itemToPointFeature: function(item) {
    return {
      type: 'Feature',
      geometry: item.feature.geometry.geometries[0]
    };
  },

  onKeyDown: function(e) {
    e = e || window.event;
    if (e.keyCode == '38' || e.keyCode == '40') {
      this.goAcross();
    } else if (e.keyCode == '37') {
      this.goSouth();
    } else if (e.keyCode == '39') {
      this.goNorth();
    }
  },

  goSouth: function() {
    this.setItem(this.getSouth(this.state.currentItem));
  },

  goNorth: function() {
    this.setItem(this.getNorth(this.state.currentItem));
  },

  goAcross: function() {
    this.setItem(this.getAcross(this.state.currentItem));
  },

  getSouth: function(item) {
    return this.getSouthOrNorth(item, 'south');
  },

  getNorth: function(item) {
    return this.getSouthOrNorth(item, 'north');
  },

  getSouthOrNorth: function(item, southOrNorth) {
    return this.findFirstDirection(item, southOrNorth, item.feature.properties.data.direction);
  },

  getAcross: function(item) {
    var direction = item.feature.properties.data.direction;
    var newDirection = (direction === 'west') ? 'east' : 'west';

    var north = this.findFirstDirection(item, 'north', newDirection);
    var south = this.findFirstDirection(item, 'south', newDirection);

    var distanceSouth = Infinity;
    var distanceNorth = Infinity;

    // Maximum jaywalk/crossing street distance, in meters
    var distanceThreshold = 100;

    if (south) {
      distanceSouth = distance(this.itemToPointFeature(item), this.itemToPointFeature(south), 'kilometers') * 1000;
    }

    if (north) {
      distanceNorth = distance(this.itemToPointFeature(item), this.itemToPointFeature(north), 'kilometers') * 1000;
    }

    if (distanceNorth <= distanceSouth && distanceNorth < distanceThreshold) {
      return north;
    } else if (distanceSouth <= distanceNorth && distanceSouth < distanceThreshold) {
      return south;
    } else {
      return null;
    }
  },

  findFirstDirection: function(item, southOrNorth, westOrEast) {
    var southToNorth = this.state.southToNorth;

    if (item[southOrNorth]) {
      // Go one photo south or north
      var tempItem = southToNorth[item[southOrNorth].properties.id];

      // Go south or north until there are either no more photos, or until photo with
      //   same direction is found
      while (tempItem[southOrNorth] && tempItem.feature.properties.data.direction !== westOrEast) {
        tempItem = southToNorth[tempItem[southOrNorth].properties.id];
      }

      if (tempItem.feature.properties.data.direction === westOrEast) {
        return tempItem;
      }
    } else {
      return null;
    }
  }

});
