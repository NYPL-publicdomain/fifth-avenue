window.React = require('react');
window.ReactDOM = require('react-dom');

var fieldsOfView = require('../data/fields-of-view.json');
var startUuid = '510d47dc-9a95-a3d9-e040-e00a18064a99';

var App = require('./app');
var el = document.getElementById('app');

ReactDOM.render(<App fieldsOfView={fieldsOfView} uuid={startUuid} />, el);
