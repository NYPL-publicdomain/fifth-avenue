var React = require('react');

module.exports = React.createClass({

  render: function() {
    var currentItem = this.props.currentItem;
    var south = this.props.getDirections.south(this.props.currentItem);
    var north = this.props.getDirections.north(this.props.currentItem);

    var styles = {
      current: {
        backgroundImage: 'url("photos/' + currentItem.uuid + '.jpg")'
      },
      south: {
        backgroundImage: south ? ('url("photos/' + south.uuid + '.jpg")') : null
      },
      north: {
        backgroundImage: north ? ('url("photos/' + north.uuid + '.jpg")') : null
      }
    };

    return (
      <section id='photos'>
        <ol>
          <li id='photo-south' ref='south' style={styles.south}></li>
          <li>
            <ol>
              <li id='photo-current' ref='current' style={styles.current}></li>
              <li id='photo-across' ref='across'></li>
            </ol>
          </li>
          <li id='photo-north' ref='north' style={styles.north}></li>
        </ol>
      </section>
    );
  }

});
