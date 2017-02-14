import {init} from './snabbdom';
import {attrs} from './snabbdom'; // for setting attributes on DOM elements
import {classes} from './snabbdom'; // makes it easy to toggle classes
import {props} from './snabbdom'; // for setting properties on DOM elements
import {styles} from './snabbdom'; // handles styling on elements with support for animations
import {events} from './snabbdom'; // attaches event listeners
import {h} from './snabbdom'; // helper function for creating vnodes
var patch = init([ // Init patch function with choosen modules
  attrs,
  classes,
  props,
  styles,
  events
]) as (oldVNode: any, vnode: any) => any;
export const snabbdomBundle = { patch, h: h as any };