# Snabbdom
A virtual DOM library. Lighter, better, faster, simpler!

# Features

* Simplicity. The core is less than 200 SLOC
* Completely modular and extensible architecture. You can mold Snabbdom into
  whatever you want.
* Performance. (yet unpublished) results from the vdom benchmarks show that
  Snabbdom is among the fastest virtual DOM libraries.
* Provides the necessary features for doing complex animations.
* Patch function with a signature like a typical reduce/scan function. For
  easier integration with a FRP library.
* A powerful set of hooks into the diffing and patching process. _WIP_.

# Usage

```javascript
var snabbdom = require('snabbdom');
var patch = snabbdom.init([ // Init patch function with modules
  require('snabbdom/modules/class'), // makes it possible to toggle classes
  require('snabbdom/modules/props'), // for setting properties on DOM elements
  require('snabbdom/modules/style'), // handles styles on elements
  require('snabbdom/modules/eventlisteners'), // attach event listeners
]);
var h = require('snabbdom/h'); // helper function for defining VNodes
var vnode = h('div#id.two.classes', {on: {click: someFn}}, [
  h('span', {style: {fontWeight: 'bold'}}, 'This is bold'),
  ' and this is just normal text',
  h('a', {props: {href: '/foo'}, 'I\'ll take you places!'})
]);
var c = document.getElementById('container');
// Patch into empty VNode – this modifies the DOM as a side effect
patch(snabbdom.emptyVNodeAt(c), h);
```

# Examples

* [Animated reordering of elements](http://paldepind.github.io/snabbdom/examples/reorder-animation/)

# Core modules

This describes the core modules.

## Class

```javascript
h('a', {class: {active: true, selected: false}}, 'Toggle');
```

## Props

## Style

## Eventlisteners

