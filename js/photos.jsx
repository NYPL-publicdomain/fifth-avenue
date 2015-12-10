var React = require('react');

module.exports = React.createClass({

  getDefaultProps: function () {
    return {
      // allow the initial position to be passed in as a prop
      initialPos: {x: 0, y: 0}
    }
  },

  getInitialState: function () {
    return {
      pos: this.props.initialPos,
      dragging: false,
      rel: null // position relative to the cursor
    }
  },

  render: function() {
    var currentItem = this.props.currentItem;
    var south = this.props.getDirections.south(this.props.currentItem);
    var north = this.props.getDirections.north(this.props.currentItem);

    var styles = {
      current: {
        backgroundImage: 'url("photos/' + currentItem.uuid + '.jpg")',
        backgroundPosition: this.state.pos.x + 'px ' + this.state.pos.y + 'px'
      },
      south: {
        backgroundImage: south ? ('url("photos/' + south.uuid + '.jpg")') : null
      },
      north: {
        backgroundImage: north ? ('url("photos/' + north.uuid + '.jpg")') : null
      }
    };

    //<li id='photo-across' ref='across'></li>

    return (
      <section id='photos'>
        <ol>
          <li id='photo-south' ref='south' style={styles.south}></li>
          <li>
            <ol>
              <li id='photo-current' ref='current' style={styles.current} onMouseDown={this.onMouseDown} ></li>

            </ol>
          </li>
          <li id='photo-north' ref='north' style={styles.north}></li>
        </ol>
      </section>
    );
  }

});
