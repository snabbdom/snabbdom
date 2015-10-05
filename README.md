# Snabbdom

A virtual DOM library with focus on simplicity, modularity, powerful features
and performance.

_Note:_ Snabbdom is mostly done. I'm currently only making minor tweaks. The
documentation however is still quite lagging.

[![Join the chat at https://gitter.im/paldepind/snabbdom](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/paldepind/snabbdom?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Table of contents

* [Introduction](#introduction)
* [Features](#features)
* [Inline example](#inline-example)
* [Examples](#examples)
* [Core documentation](#core-documentation)
* [Modules documentation](#modules-documentation)

## Why

Virtual DOM is awesome. It allow us to express our applications view as a
function of its state. But existing solutions were way way too bloated, too
slow, lacked features, had an API biased towards OOP and/or lacked features I
needed.

## Introduction

Snabbdom consists of an extremely simple, performant and extensible core that
is only ≈ 200 SLOC. It offers a modular architecture with rich functionality
for extensions through custom modules. To keep the core simple all non-essential
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
  * Features for doing complex CSS animations.
  * Powerful event listener functionality
  * Thunks to optimize the diff and patch process even further
  * JSX support thanks to [snabbdom-jsx](https://github.com/yelouafi/snabbdom-jsx)

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
var vnode = h('div#container.two.classes', {on: {click: someFn}}, [
  h('span', {style: {fontWeight: 'bold'}}, 'This is bold'),
  ' and this is just normal text',
  h('a', {props: {href: '/foo'}}, 'I\'ll take you places!')
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
representing the new updated view.

If a DOM element with a parent is passed `newVnode` will be turned into a DOM
node and the passed element will be replaced by the created DOM node. If an old
vnode is passed Snabbdom will effeciently modify to match the description in
the new vnode.

Any old vnode passed must be the resulting vnode from a previous call to
`patch`. This is necessary since Snabbdom stores information in the vnode.
This makes it possible to implement a simpler and more performant architecture.
This also avoids the creation of a new old vnode tree.

```javascript
patch(oldVnode, newVnode);
```

### `snabbdom/h`

It is recommended that you use `snabbdom/h` to create VNodes. `h` accepts a
tag/selector as a string, an optional data object and an optional string or
array of children.

```javascript
var h = require('snabbdom/h');
var vnode = h('div', {style: {color: '#000'}}, [
  h('h1', 'Headline'),
  h('p', 'A paragraph'),
]);
```

### Hooks

Hooks are a way to hook into the lifecycle of DOM nodes. Snabbdom offers a rich
selection of hooks.

#### Overview

| Name        | Triggered when | Arguments to callback |
| ----------- | -------------- | --------------------- |
| `pre`       | the patch process begins. | none |
| `create`    | a DOM element has been created based on a VNode. | `emptyVNode, vnode` |
| `insert`    | an element has been inserted into the DOM. | `vnode` |
| `prepatch`  | an element is about to be patched. | `oldVnode, vnode` |
| `update`    | an element is being updated. | `oldVnode, vnode` |
| `postpatch` | an element has been patched. | `oldVnode, vnode` |
| `remove`    | an element is directly being removed from the DOM. | `vnode, removeCallback` |
| `destroy`   | an element is being removed from the DOM or it's parent is. | `vnode` |
| `post`      | the patch process is done. | none |


#### Usage

To use hooks, pass them as an object to `hook` field of the data object
argument.

```javascript
h('div.row', {
  key: movie.rank,
  hook: {
    insert: (vnode) => { movie.elmHeight = vnode.elm.offsetHeight; }
  }
});
```

#### The `insert` hook

This hook is invoked once the DOM element to a vnode has been inserted into the
document _and_ the rest of the patch cycle is done. This means that you can do
DOM measurements (like using [getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
in this hook safely knowing that no elements will be changed afterwards which
could affect the position of the inserted elements.

#### The `remove` hook

Allows you to hook into the removal of an element. The hook is called once a
vnode is to be removed from the DOM. The handling function recieves both the
vnode and a callback. You can control and delay the removal with the callback.
It should be invoked once the hook is done doing its business and the element
will only be removed once all `remove` hooks have invoked their callback.

The hook is only triggered when and element is to be removed from its parent –
not if it is the child of an element that is removed. For that see the destroy
hook.

#### The `destroy` hook

This hook is invoked whenever an element removed from the DOM or the child
to an element that is being removed.


To see the difference between this hook and the `remove` hook consider an
example.

```js
var vnode1 = h('div', [h('div', [h('span', 'Hello')])]);
var vnode2 = h('div', []);
patch(container, vnode1);
patch(vnode1, vnode2);
```

Here `destroy` is triggered for both the inner `div` element _and_ the `span`
element it contains. `remove` on the other hand is only triggered on the `div`
element because it is the only element being detached from its parent.

You can for instance use `remove` to trigger an animation when an element is
being removed and use the `destroy` hook to additionally animate the
disappearance of the removed elements children.

## Modules documentation

This describes the core modules. All modules are optional.

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

### The attributes module

Same as props but set attributes instead of properties on DOM elements

```javascript
h('a', { attrs: {href: '/foo'} }, 'Go to Foo');
```

Attributes are added and updated using `setAttribute`. In case of an attribute 
that has been previously added/set is no longer present in the `attrs` object, 
it is removed from the DOM element's attribute list using `removeAttribute`. 

In the case of boolean attributes (.e.g. `disabled`, `hidden`, `selected` ...). 
The meaning doesn't depend on the attribute value (`true` or `false`) but depends
instead on the presence/absence of the attribute itself in the DOM element. Those 
attributes are handled differently by the module : if a boolean attribute is set 
to a [falsy value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean) (`0`, `-0`, `null`, `false`,`NaN`, `undefined`, or the empty 
string (`""`)) then the attribute will be removed from the attribute list of the
DOM element.

### The style module

The style module is for making your HTML look slick and animate smoothly. At
it's core it allows you to set CSS properties on elements.

```javascript
h('span', {
  style: {border: '1px solid #bada55', color: '#c0ffee', fontWeight: 'bold'}
}, 'Say my name, and every colour illuminates');
```

Note that the style module does not remove style attributes if they are removed
as properties from the style object. To remove a style you should instead set
it to the empty string.

```javascript
h('div', {
  style: {position: shouldFollow ? 'fixed' : ''}
}, 'I, I follow, I follow you');
```

#### Delayed properties

You can specify properties as being delayed. Whenever these properties change
the change is not applied until after the next frame.

```javascript
h('span', {
  style: {opacity: '0', transition: 'opacity 1s', delayed: {opacity: '1'}}
}, 'Imma fade right in!');
```

This makes it easy to declaratively animate the entry of elements.

#### Set properties on `remove`

Styles set in the `remove` property will take effect once the element is about
to be moved from the DOM. The applied styles should be animated with CSS
transitions. Only once all the styles is done animating will the element be
removed from the DOM.

```javascript
h('span', {
  style: {opacity: '1', transition: 'opacity 1s',
          remove: {opacity: '0'}}
}, 'It\'s better to fade out than to burn away');
```

This makes it easy to declaratively animate the removal of elements.

#### Set properties on `destroy`

```javascript
h('span', {
  style: {opacity: '1', transition: 'opacity 1s',
          destroy: {opacity: '0'}}
}, 'It\'s better to fade out than to burn away');
```

### Eventlisteners module

The event listeners module gives powerful capabilities for attaching
event listeners.

You can attach a function to an event on a VNode by supplying an object at `on`
with a property corresponding to the name of the event you want to listen to.
The function will be called when the event happens and will be passed the event
object that belongs to it.

```javascript
function clickHandler(ev) { console.log('got clicked'); }
h('div', {on: {click: clickHandler}});
```

Very often however you're not really interested in the event object itself.
Often you have some data associated with the element that triggers an event
and you want that data passed along instead.

Consider a counter application with three buttons, one to increment the counter
by 1, one to increment the counter by 2 and one to increment the counter by 3.
You're don't really care exactly which button was pressed. Instead you're
interested in what number was associated with the clicked button. The event listeners
module allows one to express that by supplying an array at the named event property.
The first element in the array should be a function that will be invoked with
the value in the second element once the event occurs.

```javascript
function clickHandler(number) { console.log('button ' + number + ' was clicked!'); }
h('div', [
  h('a', {on: {click: [clickHandler, 1]}}),
  h('a', {on: {click: [clickHandler, 2]}}),
  h('a', {on: {click: [clickHandler, 3]}}),
]);
```

Snabbdom allows swapping event handlers between renders. This happens without
actually touching the event handlers attached to the DOM.

