# Snabbdom
A virtual DOM library with focus on simplicity, modularity, powerful features
and performance.

## Table of contents

* [Introduction](#introduction)
* [Features](#features)
* [Inline example](#inline-example)
* [Examples](#examples)
* [Core documentation](#core-documentation)
* [Modules documentation](#modules-documentation)

## Introduction

Snabbdom consists of an extremely simple, performant and extensible core that
is only ≈ 200 SLOC. It offers a modular architecture with rich functionality
for extensions through custom modules. To keep the core simple all non-esential
functionality is delegated to modules.

You can mold Snabbdom into whatever you desire! Pick, choose and customize the
functionality you want. Alternatively you can just use the default extensions
and get a virtual DOM library with high performance, small size and all the
features listed below.

## Features

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

## Inline example

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

## Examples

* [Animated reordering of elements](http://paldepind.github.io/snabbdom/examples/reorder-animation/)
* [Hero transitions](http://paldepind.github.io/snabbdom/examples/hero/)

## Core documentation

The core of Snabbdom provides only the most essential functionality. It is
designed to be as simple as possible while still being fast and extendable.

### `snabbdom.init`

The core exposes only one single function `snabbdom.init`. `init` takes a list of
modules and returns a `patch` function that uses the specified set of modules.

```javascript
var patch = snabbdom.init([
  require('snabbdom/modules/class'),
  require('snabbdom/modules/style'),
]);
```

### `patch`

The `patch` function returned by `init` takes two arguments. The first is a DOM
element or a vnode representing the current view. The second is a vnode
representing the new view.

```javascript
patch(oldVnode, newVnode);
```

### `snabbdom/h`

It is recommended that you use `snabbdom/h` to create VNodes. `h` accepts a a
tag/selector as a string, an optional data object and an option string or array of children.

```javascript
var h = require('snabbdom/h');
var vnode = h('div', {style: {color: '#000'}}, [
  h('h1', 'Headline'),
  h('p', 'A paragraph'),
]);
```

### Hooks

| Name      | Triggered when | Arguments to callback |
| --------- | -------------- | --------------------- |
| `pre`     | the patch process begins. | |
| `create`  | a DOM element has been created based on a VNode. | `emptyVNode, createdVnode` |
| `insert`  | an element has been inserted into the DOM. | `insertedVnode` |
| `patch`   | an element is about to be patched. | `oldVnode, newVnode` |
| `update`  | an element is being updated. | `oldVnode, newVnode` |
| `remove`  | an element is directly being removed from the DOM. | `vnode, removeCallback` |
| `destroy` | an element is begin removed from the DOM or it's parent is. | `vnode` |
| `post`    | the patch process is done. | |

## Modules documentation

This describes the core modules.

### The class module

The class module provides an easy way to dynamically toggle classes on
elements. It expects an object in the `class` data property. The object should
map class names to booleans that indicates whether or not the class should stay
or go on the VNode.

```javascript
h('a', {class: {active: true, selected: false}}, 'Toggle');
```

### The props module

Allows you to set properties on DOM elements.

```javascript
h('a', {props: {href: '/foo'}, 'Go to Foo');
```

### The style module

The style module is for making your HTML look slick and animate smoothly. At
it's core it allows you to set CSS properties on elements.

```javascript
h('span', {
  style: {border: '1px solid #bada55', color: '#c0ffee', fontWeight: 'bold'}
}, 'Say my name, and every colour illuminates');
```

#### Delayed properties

You can specify properties as being delayed. Whenver these properties change
the change is not applied until after the next frame.

```javascript
h('span', {
  style: {opacity: '0', transitionDuration: 'opacity 1s', delayed: {opacity: '1'}}
}, 'Imma fade right in!');
```

#### Set properties on `remove`

```javascript
h('span', {
  style: {opacity: '1', transitionDuration: 'opacity 1s',
          remove: {opacity: '1'}}
}, 'It\'s better to fade out than to burn away');
```

#### Set properties on `destroy`

```javascript
h('span', {
  style: {opacity: '1', transitionDuration: 'opacity 1s',
          destroy: {opacity: '1'}}
}, 'It\'s better to fade out than to burn away');
```

### Eventlisteners module

The event listeners module gives powerful capabilities for attaching
event listeners.

You can attach a function that will be called with the event object.

```javascript
function clickHandler(ev) { console.log('got clicked'); }
h('div', {on: {click: clickHandler}});
```

We can also use the array syntax to attach a function that will be
invoked with a constant value.

```javascript
function clickHandler(number) { console.log('button ' + number + ' was clicked!'); }
h('div', [
  h('a', {on: {click: [clickHandler, 1]}}),
  h('a', {on: {click: [clickHandler, 2]}}),
  h('a', {on: {click: [clickHandler, 3]}}),
]);
```
