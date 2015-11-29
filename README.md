# Snabbdom

A virtual DOM library with focus on simplicity, modularity, powerful features
and performance.

[![Join the chat at https://gitter.im/paldepind/snabbdom](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/paldepind/snabbdom?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Table of contents

* [Introduction](#introduction)
* [Features](#features)
* [Inline example](#inline-example)
* [Examples](#examples)
* [Core documentation](#core-documentation)
* [Modules documentation](#modules-documentation)
* [Helpers](#helpers)

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
  * `h` function for easily creating virtual DOM nodes
  * [SVG just _works with_ the `h` helper](#svg).m
  * Features for doing complex CSS animations.
  * Powerful event listener functionality
  * [Thunks](#thunks) to optimize the diff and patch process even further
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
var newVnode = h('div#container.two.classes', {on: {click: anotherEventHandler}}, [
  h('span', {style: {fontWeight: 'normal', fontStyle: 'italics'}}, 'This is now italics'),
  ' and this is still just normal text',
  h('a', {props: {href: '/bar'}}, 'I\'ll take you places!')
]);
// Second `patch` invocation
patch(vnode, newVnode); // Snabbdom efficiently updates the old view to the new state
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

Hooks are a way to hook into the lifecycle of DOM nodes. Snabbdom
offers a rich selection of hooks. Hooks are used both by modules to
extend Snabbdom and in normal code for executing arbitrary code at
desired points in the life of a virtual node.

#### Overview

| Name        | Triggered when                                     | Arguments to callback   |
| ----------- | --------------                                     | ----------------------- |
| `pre`       | the patch process begins                           | none                    |
| `create`    | a DOM element has been created based on a VNode    | `emptyVNode, vnode`     |
| `insert`    | an element has been inserted into the DOM          | `vnode`                 |
| `prepatch`  | an element is about to be patched                  | `oldVnode, vnode`       |
| `update`    | an element is being updated                        | `oldVnode, vnode`       |
| `postpatch` | an element has been patched                        | `oldVnode, vnode`       |
| `remove`    | an element is directly being removed from the DOM  | `vnode, removeCallback` |
| `destroy`   | an element is directly or indirectly begin removed | `vnode`                 |
| `post`      | the patch process is done                          | none                    |

The following hooks are available for modules: `pre`, `create`,
`update`, `remove`, destroy`, `post`.

The following hooks are available in the `hook` property of individual
elements: `create`, `insert`, `prepatch`, `update`, `postpatch`,
`remove`, `destroy`.

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

### Creating modules

Modules works by registering global listeners for the [hooks](#hooks). A module as simply a dictionary from hook names to functions.

```javascript
var myModule = {
  create: function(oldVnode, vnode) {
    // invoked whenever a new virtual node is created
  },
  update: function(oldVnode, vnode) {
    // invoked whenever a virtual node is updated
  }
};

With this mechanism you can easily argument the behaviour of
Snabbdom. For demonstration take a look at the implementations of the
default modules.

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

Note, however, that **you should be careful when sharing event handlers between
VNodes**, because of the technique this module uses to avoid re-binding
event handlers to the DOM. (And in general, sharing data between VNodes is
not guaranteed to work, because modules are allowed to mutate the given data).

In particular, you should **not** do something like this:

```javascript
// Does not work
var sharedHandler = {
  change: function(e){ console.log('you chose: ' + e.target.value); }
};
h('div', [
  h('input', {props: {type: 'radio', name: 'test', value: '0'}, 
              on: sharedHandler}),
  h('input', {props: {type: 'radio', name: 'test', value: '1'}, 
              on: sharedHandler}),
  h('input', {props: {type: 'radio', name: 'test', value: '2'}, 
              on: sharedHandler})
]);
```

For many such cases, you can use array-based handlers instead (described above).
Alternatively, simply make sure each node is passed unique `on` values:

```javascript
// Works
var sharedHandler = function(e){ console.log('you chose: ' + e.target.value); };
h('div', [
  h('input', {props: {type: 'radio', name: 'test', value: '0'}, 
              on: {change: sharedHandler}}),
  h('input', {props: {type: 'radio', name: 'test', value: '1'}, 
              on: {change: sharedHandler}}),
  h('input', {props: {type: 'radio', name: 'test', value: '2'}, 
              on: {change: sharedHandler}})
]);
```

## Helpers

### SVG

SVG just works when using the `h` function for creating virtual
nodes. SVG elements are automatially created with the appropriate
namespaces.

```javascript
var vnode = h('div', [
  h('svg', {attrs: {width: 100, height: 100}}, [
    h('circle', {attrs: {cx: 50, cy: 50, r: 40, stroke: 'green', 'stroke-width': 4, fill: 'yellow'}})
  ])
]);
```

See also the [SVG example](./examples/svg).

### Thunks

The thunks function takes an id for identifying a thunk, a function that
returns a vnode and a variable amount of state parameters. If invoked the
render function will recieve the state parameters.

`thunks(uniqueName, renderFn, [stateAguments])`

Thunks is an optimation strategy that can be used when one is dealing with
immutable data.

Consider a simple function for creating a virtual node based on a number.

```js
function numberView(n) {
  return h('div', 'Number is: ' + n);
}
```

The view depends only on `n`. This means that if `n` is unchanged then
creating the virtual DOM node and patching it against the old vnode is
wasteful. To avoid the overhead we can use the `thunk` helper function.

```js
function render(state) {
  return thunk('num', numberView, state.number);
}
```

Instead of actually invokaing the `numberView` function this will only place
a dummy vnode in the virtual tree. When Snabbdom patches this dummy vnode
against a previous vnode it will compare the value of `n`. If `n` is unchanged
it will simply reuse the old vnode. This avoids recreating the number view and
the diff process altogether.

The view function here is only an example. In practice thunks are only
relevant if you are rendering a complicated view that takes a significant
computation time to generate.

