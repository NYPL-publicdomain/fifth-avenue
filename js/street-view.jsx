var React = require('react');

var googleMaps = require('google-maps-api')('AIzaSyAujmCClV_Kl-12EQbE5jZG4fzdS3LyfHo');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      panorama: null,
      colorFilters: true
    };
  },

  render: function() {
    if (this.props.currentItem) {
      var feature = this.props.currentItem.feature;
      var bearing = feature.properties.bearing;
      var point = feature.geometry.geometries[0].coordinates;
      var position = {
        lat: point[1],
        lng: point[0]
      };

      var pov = {
        heading: bearing,
        pitch: 10
      }

      this.setView(position, pov);

      var className = 'aspect-ratio';
      if (this.state.colorFilters) {
        className += ' color-filters';
      }

      return (
        <div id='street-view-container'>
          <div id='street-view' className={className} />
          <a href='#' onClick={this.toggleColorFilters}>Toggle real colors</a>
        </div>
      );
    } else {
      return null;
    }
  },

  componentDidMount: function() {
    if (!this.state.googleMapsApi) {
      googleMaps().then(googleMapsApi => {
        var panorama = new googleMapsApi.StreetViewPanorama(
          document.getElementById('street-view'), {
            zoom: 0,
            linksControl: false,
            panControl: false,
            zoomControl: false,
            addressControl: false
          }
        );

        this.setState({
          panorama: panorama
        });
      });
    }
  },

  setView: function(position, pov) {
    if (this.state.panorama) {
      this.state.panorama.setPosition(position);
      this.state.panorama.setPov(pov);
    }
  },

  toggleColorFilters: function() {
    this.setState({
      colorFilters: !this.state.colorFilters
    });
  }

});
