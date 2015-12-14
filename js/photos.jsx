var React = require('react');
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

    //<li id='photo-across' ref='across'></li>

    return (
      <div>
        <section id='photos-container'>
          <nav>
            <ul>
              <li className='align-left'>← <a href='#' onClick={this.goSouth}>South</a></li>
              <li className='align-middle'>↕ <a href='#' onClick={this.goAcross}>Cross street</a></li>
              <li className='align-right'><a href='#' onClick={this.goNorth}>North</a> →</li>
            </ul>
          </nav>
          <div id='photos' className='aspect-ratio'>
            <ol>
              <ReactCSSTransitionGroup transitionName='example' transitionEnterTimeout={500} transitionLeaveTimeout={500}>
                {south ? <li key={south.uuid} id='photo-south' ref='south' style={styles.south}></li> : null }
                <li key={current.uuid} id='photo-current' ref='current' style={styles.current} onClick={this.handleClick} ></li>
                { north ? <li key={north.uuid} id='photo-north' ref='north' style={styles.north}></li> : null }
              </ReactCSSTransitionGroup>
            </ol>
          </div>
        </section>
      </div>
    );
  },

  handleClick: function(e) {
    var width = e.target.clientWidth;
    var height = e.target.clientHeight;
    // var perc = e.offsetX/ $(this).width() * 100;
    // $(this).html(e.offsetX + " | " + perc + " perc");
    //
    // var x = e.clientX;
    // var y = e.clientY;
    //
    // console.log(x, y, e)




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
