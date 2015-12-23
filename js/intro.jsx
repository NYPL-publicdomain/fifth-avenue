var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (
      <section id='intro-container' className='margin-top full-width'>
        <h1>Street View, Then &amp; Now: New York City's Fifth Avenue</h1>
        <div id='cover-container' className='aspect-ratio'>
          <a id='cover' href='javascript:void(0)' onClick={this.props.close}></a>
        </div>
        <p>
          From <a href='http://digitalcollections.nypl.org/collections/fifth-avenue-new-york-from-start-to-finish#/?tab=about'>The New York Public Library Digital Collections</a>:
        </p>
        <blockquote className='columns'>
          Fifth Avenue, the street that became the social and cultural spine of New York's elite, first appeared on the Commissioners&#39; Map
          of 1811. At that time, it was merely a country road to Yorkville (then just a tiny self-contained village), but in the proposed
          grid plan it would be a grand boulevard. As the City grew and prospered Fifth Avenue became synonymous with fashionable life,
          the site of mansions, cultural and social institutions, and restaurants and shops catering to the elite.

          In 1907, alarmed at the approach of factories, the leading merchants and residents formed the Fifth Avenue Association.
          The <em>Save New York Committee</em> became a bulwark against the wrong kind of development. Perhaps inspired by this contemporary
          movement, photographer Burton Welles used a wide-angled view camera in 1911 to document this most important street from Washington Square, north to East 93rd Street.
        </blockquote>
        <p>
          With this <a href="//publicdomain.nypl.org">public domain remix</a>, you can compare the photos from the 1911 <a href="http://digitalcollections.nypl.org/collections/fifth-avenue-new-york-from-start-to-finish#/?tab=about">Fifth Avenue from Start to Finish collection</a> with
          2015's <a href='https://www.google.nl/maps/@40.7528429,-73.9813567,3a,75y,299.2h,96.54t/data=!3m6!1e1!3m4!1sFR-Gcj5IDRGxJ72fhcikWw!2e0!7i13312!8i6656'>Google Street View</a>. Use your keyboard's arrow keys, click on the markers on the map, or use the controls on the screen to move up and down Firth Avenue.
        </p>
        <div id='button-container'>
          <button onClick={this.props.close}>Take me to 1911!</button>
        </div>
      </section>
    );
  }
});
