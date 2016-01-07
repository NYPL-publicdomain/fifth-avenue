var React = require('react');
var ReactDOM = require('react-dom');

var Intro = require('./intro');
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
      southToNorth[feature.properties.data.uuid] = {
        uuid: feature.properties.data.uuid,
        index: i,
        north: (i < length - 1) ? fieldsOfView.features[i + 1] : null,
        south: (i > 0) ? fieldsOfView.features[i - 1] : null,
        feature: feature
      };
    });

    return {
      intro: true,
      uuid: this.props.uuid,
      mapRadius: 75,
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
    if (this.state.intro) {
      return (
        <article ref='article'>
          <Intro close={this.closeIntro} />
        </article>
      );
    } else {
      return (
        <article ref='article'>
          <Photos ref='photos' setUuid={this.setUuid} currentItem={this.state.currentItem} getDirections={this.state.getDirections} goDirections={this.state.goDirections} />
          <Map ref='map' setUuid={this.setUuid} currentItem={this.state.currentItem} fieldsOfView={this.state.fieldsOfView} radius={this.state.mapRadius}/>
          <StreetView currentItem={this.state.currentItem} />
        </article>
      );
    }
  },

  componentDidMount: function() {
    document.onkeydown = this.onKeyDown;
    window.addEventListener('resize', this.handleResize);
  },

  closeIntro: function() {
    this.setState({
      intro: false,
      mapRadius: this.getMapRadius()
    });
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
      var tempItem = southToNorth[item[southOrNorth].properties.data.uuid];

      // Go south or north until there are either no more photos, or until photo with
      //   same direction is found
      while (tempItem[southOrNorth] && tempItem.feature.properties.data.direction !== westOrEast) {
        tempItem = southToNorth[tempItem[southOrNorth].properties.data.uuid];
      }

      if (tempItem.feature.properties.data.direction === westOrEast) {
        return tempItem;
      }
    } else {
      return null;
    }
  },

  getMapRadius: function() {
    var article = ReactDOM.findDOMNode(this.refs.article);
    var mapRadius = Math.round(article.clientWidth / 15);

    return Math.max(mapRadius, 50);
  },


  handleResize: function() {
    if (!this.state.intro) {
      this.setState({
        mapRadius: this.getMapRadius()
      });
    }
  }
});
