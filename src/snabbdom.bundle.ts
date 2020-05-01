import { init } from './snabbdom.js';
import { attributesModule } from './modules/attributes.js'; // for setting attributes on DOM elements
import { classModule } from './modules/class.js'; // makes it easy to toggle classes
import { propsModule } from './modules/props.js'; // for setting properties on DOM elements
import { styleModule } from './modules/style.js'; // handles styling on elements with support for animations
import { eventListenersModule } from './modules/eventlisteners.js'; // attaches event listeners

// helper function for creating vnodes
import { h } from './h.js';

var patch = init([ // Init patch function with choosen modules
  attributesModule,
  classModule,
  propsModule,
  styleModule,
  eventListenersModule
]) as (oldVNode: any, vnode: any) => any;
export const snabbdomBundle = { patch, h: h as any };
export default snabbdomBundle;
