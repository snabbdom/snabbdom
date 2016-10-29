var snabbdom = require('./snabbdom');
var patch = snabbdom.init([ // Init patch function with choosen modules
  require('./modules/attributes'), // makes it easy to toggle classes
  require('./modules/class'), // makes it easy to toggle classes
  require('./modules/props'), // for setting properties on DOM elements
  require('./modules/style'), // handles styling on elements with support for animations
  require('./modules/eventlisteners'), // attaches event listeners
]);
var h = require('./h'); // helper function for creating vnodes

module.exports = { patch: patch, h: h }
