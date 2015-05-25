# Snabbdom
A virtual DOM library with focus on simplicity, modularity, powerful features
and performance.

# Introduction

Snabbdom consists of an extremely simple, performant and extensible core that
is only ≈ 200 SLOC. It offers a modular architecture with rich functionality
for extensions through custom modules. To keep the core simple all non-esential
functionality is delegated to modules.

You can mold Snabbdom into whatever you want! Pick, choose and customize the
functionality that you want. Alternatively you can just use the default
extensions and get a virtual DOM library with high performance, small size and
powerful features.

# Features

* *Core features*
  * About 200 SLOC – you could easily read through the entire core and fully
    understand how it works
  * Modules can hook into any part of the diff and patch process
  * Extendable through modules
  * Splendid performance. Snabbdom is among the fastest virtual DOM libraries
    in the vdom benchmarks.
  * Provides the necessary features for doing complex animations.
  * Patch function with a function signature equivelant to a reduce/scan
    function. Allows for easier integration with a FRP library.
* *The style module*
* *Event listeners*
  * Typical attachment of function to an event
  * Attach listeners function along with value passed to listener
* *The hero animation module*
* *Misc*
  * Thunks. To optimize the diff and patch process even further

# Example

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
var container = document.getElementById('container');
// Patch into empty VNode – this modifies the DOM as a side effect
patch(container, vnode);
```

# Examples

* [Animated reordering of elements](http://paldepind.github.io/snabbdom/examples/reorder-animation/)
* [Hero transitions](http://paldepind.github.io/snabbdom/examples/hero/)

# Core modules

This describes the core modules.

## Class

```javascript
h('a', {class: {active: true, selected: false}}, 'Toggle');
```

## Props

## Style

## Eventlisteners

