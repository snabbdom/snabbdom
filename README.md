# Snabbdom
A virtual DOM library with focus on simplicity, modularity, powerful features
and performance.

# Table of contents

* [Introduction](#introduction)
* [Features](#features)
* [Inline example](#inline-example)
* [Examples](#examples)
* [Core documentation](#core-documentation)
* [Modules documentation](#modules-documentation)

# Introduction

Snabbdom consists of an extremely simple, performant and extensible core that
is only ≈ 200 SLOC. It offers a modular architecture with rich functionality
for extensions through custom modules. To keep the core simple all non-esential
functionality is delegated to modules.

You can mold Snabbdom into whatever you desire! Pick, choose and customize the
functionality you want. Alternatively you can just use the default extensions
and get a virtual DOM library with high performance, small size and all the
features listed below.

# Features

* Core features
  * About 200 SLOC – you could easily read through the entire core and fully
    understand how it works.
  * Extendable through modules.
  * A rich set of hooks available both per vnode and globally for modules
    so they can hook into any part of the diff and patch process.
  * Splendid performance. Snabbdom is among the fastest virtual DOM libraries
    in the [Virtual DOM Benchmark](http://vdom-benchmark.github.io/vdom-benchmark/).
  * Patch function with a function signature equivelant to a reduce/scan
    function. Allows for easier integration with a FRP library.
* Features in modules
  * Features for doing complex animations.
  * Powerful event listener functionality
  * Thunks to optimize the diff and patch process even further

# Inline example

```javascript
var snabbdom = require('snabbdom');
var patch = snabbdom.init([ // Init patch function with choosen modules
  require('snabbdom/modules/class'), // makes it easy to toggle classes
  require('snabbdom/modules/props'), // for setting properties on DOM elements
  require('snabbdom/modules/style'), // handles styling on elements with support for animations
  require('snabbdom/modules/eventlisteners'), // attaches event listeners
]);
var h = require('snabbdom/h'); // helper function for creating VNodes
var vnode = h('div#id.two.classes', {on: {click: someFn}}, [
  h('span', {style: {fontWeight: 'bold'}}, 'This is bold'),
  ' and this is just normal text',
  h('a', {props: {href: '/foo'}, 'I\'ll take you places!'})
]);
var container = document.getElementById('container');
// Patch into empty DOM element – this modifies the DOM as a side effect
patch(container, vnode);
```

# Examples

* [Animated reordering of elements](http://paldepind.github.io/snabbdom/examples/reorder-animation/)
* [Hero transitions](http://paldepind.github.io/snabbdom/examples/hero/)

# Core documentation

The core of Snabbdom provides only the most essential functionality. It is
designed to be as simple as possible while still being fast and extendable.

It exports only one single function: `snabbdom.init`. `init` takes a list of
modules and returns a `patch` function that uses the specified set of modules.

```javascript
var patch = snabbdom.init([
  require('snabbdom/modules/class'),
  require('snabbdom/modules/style'),
]);
```

The returned patch function takes two arguments. The first is a DOM element or
a vnode representing the current view and the second is a vnode representing
the new view.

```javascript
patch(oldVnode, newVnode);
```

# Modules documentation

This describes the core modules.

### Class module

```javascript
h('a', {class: {active: true, selected: false}}, 'Toggle');
```

### Props module

```javascript
h('a', {props: {href: '/foo'}, 'Go to Foo');
```

### Style module

### Eventlisteners module

