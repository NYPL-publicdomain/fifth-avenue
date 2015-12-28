var React = require('react');
var ReactDOM = require('react-dom');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

module.exports = React.createClass({

  getInitialState: function () {
    return {};
  },

  render: function() {
    var current = this.props.currentItem;
    var south = this.props.getDirections.south(this.props.currentItem);
    var north = this.props.getDirections.north(this.props.currentItem);

    var styles = {
      current: {
        backgroundImage: 'url("photos/' + current.uuid + '.jpg")'
      },
      south: {
        backgroundImage: south ? ('url("photos/' + south.uuid + '.jpg")') : null
      },
      north: {
        backgroundImage: north ? ('url("photos/' + north.uuid + '.jpg")') : null
      }
    };

    var uuids = {
      current: current.uuid,
      south: south ? south.uuid : null,
      north: north ? north.uuid : null
    };

    var dcLink = 'http://digitalcollections.nypl.org/items/' + current.uuid;

    var direction = current.feature.properties.data.direction;

    var left = 'south';
    var right = 'north'
    if (direction === 'east') {
      [left, right] = [right, left];
    }

    return (
      <section id='photos-container' className='margin-top full-width'>
        <div className='section-header'>
          <h3>1911:</h3>
          <div className='menu'>
            ← <a href='javascript:void(0)' onClick={this.goSouth}>go south</a>,
            → <a href='javascript:void(0)' onClick={this.goNorth}>go north</a>,
            ↕ <a href='javascript:void(0)' onClick={this.goAcross}>cross the street</a>,
            or open in <a target='_blank' href={dcLink}>Digital Collections</a>
          </div>
        </div>
        <div id='photos' className='aspect-ratio'>
          <ol>
            <ReactCSSTransitionGroup transitionName='example' transitionEnterTimeout={500} transitionLeaveTimeout={500}>
              <li key={uuids[left]} id='photo-left' ref='left' style={styles[left]}></li>
              <li key={uuids.current} id='photo-current' ref='current' style={styles.current} onMouseDown={this.handleClick} ></li>
              <li key={uuids[right]} id='photo-right' ref='right' style={styles[right]}></li>
            </ReactCSSTransitionGroup>
          </ol>
        </div>
      </section>
    );
  },

  handleClick: function(e) {
    var photo = ReactDOM.findDOMNode(this.refs.current);

    var elementX = e.pageX - photo.getBoundingClientRect().left;
    var percentage = elementX / photo.clientWidth;

    if (percentage > 0.5) {
      this.goRight();
    } else {
      this.goLeft();
    }
  },

  goLeft: function() {
    var current = this.props.currentItem;
    var direction = current.feature.properties.data.direction;

    if (direction === 'east') {
      this.goNorth();
    } else {
      this.goSouth();
    }
  },

  goRight: function() {
    var current = this.props.currentItem;
    var direction = current.feature.properties.data.direction;

    if (direction === 'east') {
      this.goSouth();
    } else {
      this.goNorth();
    }
  },

  goSouth: function() {
    this.props.goDirections.south();
  },

  goNorth: function() {
    this.props.goDirections.north();
  },

  goAcross: function() {
    this.props.goDirections.across();
  }

});
