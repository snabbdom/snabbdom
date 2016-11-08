import snabbdom = require('./snabbdom');
import attributesModule = require('./modules/attributes'); // for setting attributes on DOM elements
import classModule = require('./modules/class'); // makes it easy to toggle classes
import propsModule = require('./modules/props'); // for setting properties on DOM elements
import styleModule = require('./modules/style'); // handles styling on elements with support for animations
import eventListenersModule = require('./modules/eventlisteners'); // attaches event listeners
import h = require('./h'); // helper function for creating vnodes
var patch = snabbdom.init([ // Init patch function with choosen modules
  attributesModule,
  classModule,
  propsModule,
  styleModule,
  eventListenersModule
]) as (oldVNode: any, vnode: any) => any;

export = { patch, h: h as any };