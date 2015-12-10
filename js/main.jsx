window.React = require('react');
window.ReactDOM = require('react-dom');

var fieldsOfView = require('../data/cones.json');
var startUuid = '74db14a0-c6ca-012f-8de3-58d385a7bc34';

var App = require('./app');
var el = document.getElementById('app');

ReactDOM.render(<App fieldsOfView={fieldsOfView} uuid={startUuid} />, el);
