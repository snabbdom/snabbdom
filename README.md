<img alt="Snabbdom" src="readme-title.svg" width="356px">

A virtual DOM library with focus on simplicity, modularity, powerful features
and performance.

---

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/snabbdom/snabbdom/actions/workflows/steps.yml/badge.svg)](https://github.com/snabbdom/snabbdom/actions/workflows/steps.yml)
[![npm version](https://badge.fury.io/js/snabbdom.svg)](https://badge.fury.io/js/snabbdom)
[![npm downloads](https://img.shields.io/npm/dm/snabbdom.svg)](https://www.npmjs.com/package/snabbdom)
[![Join the chat at https://gitter.im/snabbdom/snabbdom](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/snabbdom/snabbdom?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Donate to our collective](https://opencollective.com/snabbdom/donate/button@2x.png?color=blue)](https://opencollective.com/snabbdom#section-contribute)

Thanks to [Browserstack](https://www.browserstack.com/) for providing access to
their great cross-browser testing tools.

---

English | [简体中文](./README-zh_CN.md)

## Introduction

Virtual DOM is awesome. It allows us to express our application's view
as a function of its state. But existing solutions were way way too
bloated, too slow, lacked features, had an API biased towards OOP
and/or lacked features I needed.

Snabbdom consists of an extremely simple, performant and extensible
core that is only ≈ 200 SLOC. It offers a modular architecture with
rich functionality for extensions through custom modules. To keep the
core simple, all non-essential functionality is delegated to modules.

You can mold Snabbdom into whatever you desire! Pick, choose and
customize the functionality you want. Alternatively you can just use
the default extensions and get a virtual DOM library with high
performance, small size and all the features listed below.

## Features

- Core features
  - About 200 SLOC – you could easily read through the entire core and fully
    understand how it works.
  - Extendable through modules.
  - A rich set of hooks available, both per vnode and globally for modules,
    to hook into any part of the diff and patch process.
  - Splendid performance. Snabbdom is among the fastest virtual DOM libraries.
  - Patch function with a function signature equivalent to a reduce/scan
    function. Allows for easier integration with a FRP library.
- Features in modules
  - `h` function for easily creating virtual DOM nodes.
  - [SVG _just works_ with the `h` helper](#svg).
  - Features for doing complex CSS animations.
  - Powerful event listener functionality.
  - [Thunks](#thunks) to optimize the diff and patch process even further.
  - [JSX support, including TypeScript types](#jsx)
- Third party features
  - Server-side HTML output provided by [snabbdom-to-html](https://github.com/acstll/snabbdom-to-html).
  - Compact virtual DOM creation with [snabbdom-helpers](https://github.com/krainboltgreene/snabbdom-helpers).
  - Template string support using [snabby](https://github.com/jamen/snabby).
  - Virtual DOM assertion with [snabbdom-looks-like](https://github.com/jvanbruegge/snabbdom-looks-like)

## Example

```mjs
import {
  init,
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
  h,
} from "snabbdom";

const patch = init([
  // Init patch function with chosen modules
  classModule, // makes it easy to toggle classes
  propsModule, // for setting properties on DOM elements
  styleModule, // handles styling on elements with support for animations
  eventListenersModule, // attaches event listeners
]);

const container = document.getElementById("container");

const vnode = h("div#container.two.classes", { on: { click: someFn } }, [
  h("span", { style: { fontWeight: "bold" } }, "This is bold"),
  " and this is just normal text",
  h("a", { props: { href: "/foo" } }, "I'll take you places!"),
]);
// Patch into empty DOM element – this modifies the DOM as a side effect
patch(container, vnode);

const newVnode = h(
  "div#container.two.classes",
  { on: { click: anotherEventHandler } },
  [
    h(
      "span",
      { style: { fontWeight: "normal", fontStyle: "italic" } },
      "This is now italic type"
    ),
    " and this is still just normal text",
    h("a", { props: { href: "/bar" } }, "I'll take you places!"),
  ]
);
// Second `patch` invocation
patch(vnode, newVnode); // Snabbdom efficiently updates the old view to the new state
```

## More examples

- [Animated reordering of elements](http://snabbdom.github.io/snabbdom/examples/reorder-animation/)
- [Hero transitions](http://snabbdom.github.io/snabbdom/examples/hero/)
- [SVG Carousel](http://snabbdom.github.io/snabbdom/examples/carousel-svg/)

---

## Table of contents

- [Core documentation](#core-documentation)
  - [`init`](#init)
  - [`patch`](#patch)
    - [Unmounting](#unmounting)
  - [`h`](#h)
  - [`fragment`](#fragment-experimental) (experimental)
  - [`tovnode`](#tovnode)
  - [Hooks](#hooks)
    - [Overview](#overview)
    - [Usage](#usage)
    - [The `init` hook](#the-init-hook)
    - [The `insert` hook](#the-insert-hook)
    - [The `remove` hook](#the-remove-hook)
    - [The `destroy` hook](#the-destroy-hook)
  - [Creating modules](#creating-modules)
- [Modules documentation](#modules-documentation)
  - [The class module](#the-class-module)
  - [The props module](#the-props-module)
  - [The attributes module](#the-attributes-module)
  - [The dataset module](#the-dataset-module)
  - [The style module](#the-style-module)
    - [Custom properties (CSS variables)](#custom-properties-css-variables)
    - [Delayed properties](#delayed-properties)
    - [Set properties on `remove`](#set-properties-on-remove)
    - [Set properties on `destroy`](#set-properties-on-destroy)
  - [The eventlisteners module](#the-eventlisteners-module)
- [SVG](#svg)
  - [Classes in SVG Elements](#classes-in-svg-elements)
- [Thunks](#thunks)
- [JSX](#jsx)
  - [TypeScript](#typescript)
  - [Babel](#babel)
- [Virtual Node](#virtual-node)
  - [sel : String](#sel--string)
  - [data : Object](#data--object)
  - [children : Array<vnode>](#children--arrayvnode)
  - [text : string](#text--string)
  - [elm : Element](#elm--element)
  - [key : string | number](#key--string--number)
- [Structuring applications](#structuring-applications)
- [Common errors](#common-errors)
- [Opportunity for community feedback](#opportunity-for-community-feedback)

## Core documentation

The core of Snabbdom provides only the most essential functionality.
It is designed to be as simple as possible while still being fast and
extendable.

### `init`

The core exposes only one single function `init`. This `init`
takes a list of modules and returns a `patch` function that uses the
specified set of modules.

```mjs
import { classModule, styleModule } from "snabbdom";

const patch = init([classModule, styleModule]);
```

### `patch`

The `patch` function returned by `init` takes two arguments. The first
is a DOM element or a vnode representing the current view. The second
is a vnode representing the new, updated view.

If a DOM element with a parent is passed, `newVnode` will be turned
into a DOM node, and the passed element will be replaced by the
created DOM node. If an old vnode is passed, Snabbdom will efficiently
modify it to match the description in the new vnode.

Any old vnode passed must be the resulting vnode from a previous call
to `patch`. This is necessary since Snabbdom stores information in the
vnode. This makes it possible to implement a simpler and more
performant architecture. This also avoids the creation of a new old
vnode tree.

```mjs
patch(oldVnode, newVnode);
```

#### Unmounting

While there is no API specifically for removing a VNode tree from its mount point element, one way of almost achieving this is providing a comment VNode as the second argument to `patch`, such as:

```mjs
patch(
  oldVnode,
  h("!", {
    hooks: {
      post: () => {
        /* patch complete */
      },
    },
  })
);
```

Of course, then there is still a single comment node at the mount point.

### `h`

It is recommended that you use `h` to create vnodes. It accepts a
tag/selector as a string, an optional data object and an optional string or
array of children.

```mjs
import { h } from "snabbdom";

const vnode = h("div", { style: { color: "#000" } }, [
  h("h1", "Headline"),
  h("p", "A paragraph"),
]);
```

### `fragment` (experimental)

Caution: This feature is currently experimental and must be opted in.
Its API may be changed without an major version bump.

```mjs
const patch = init(modules, undefined, {
  experimental: {
    fragments: true,
  },
});
```

Creates a virtual node that will be converted to a document fragment containing the given children.

```mjs
import { fragment, h } from "snabbdom";

const vnode = fragment(["I am", h("span", [" a", " fragment"])]);
```

### `tovnode`

Converts a DOM node into a virtual node. Especially good for patching over an pre-existing,
server-side generated content.

```mjs
import {
  init,
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
  h,
  toVNode,
} from "snabbdom";

const patch = init([
  // Init patch function with chosen modules
  classModule, // makes it easy to toggle classes
  propsModule, // for setting properties on DOM elements
  styleModule, // handles styling on elements with support for animations
  eventListenersModule, // attaches event listeners
]);

const newVNode = h("div", { style: { color: "#000" } }, [
  h("h1", "Headline"),
  h("p", "A paragraph"),
]);

patch(toVNode(document.querySelector(".container")), newVNode);
```

### Hooks

Hooks are a way to hook into the lifecycle of DOM nodes. Snabbdom
offers a rich selection of hooks. Hooks are used both by modules to
extend Snabbdom, and in normal code for executing arbitrary code at
desired points in the life of a virtual node.

#### Overview

| Name        | Triggered when                                     | Arguments to callback   |
| ----------- | -------------------------------------------------- | ----------------------- |
| `pre`       | the patch process begins                           | none                    |
| `init`      | a vnode has been added                             | `vnode`                 |
| `create`    | a DOM element has been created based on a vnode    | `emptyVnode, vnode`     |
| `insert`    | an element has been inserted into the DOM          | `vnode`                 |
| `prepatch`  | an element is about to be patched                  | `oldVnode, vnode`       |
| `update`    | an element is being updated                        | `oldVnode, vnode`       |
| `postpatch` | an element has been patched                        | `oldVnode, vnode`       |
| `destroy`   | an element is directly or indirectly being removed | `vnode`                 |
| `remove`    | an element is directly being removed from the DOM  | `vnode, removeCallback` |
| `post`      | the patch process is done                          | none                    |

The following hooks are available for modules: `pre`, `create`,
`update`, `destroy`, `remove`, `post`.

The following hooks are available in the `hook` property of individual
elements: `init`, `create`, `insert`, `prepatch`, `update`,
`postpatch`, `destroy`, `remove`.

#### Usage

To use hooks, pass them as an object to `hook` field of the data
object argument.

```mjs
h("div.row", {
  key: movie.rank,
  hook: {
    insert: (vnode) => {
      movie.elmHeight = vnode.elm.offsetHeight;
    },
  },
});
```

#### The `init` hook

This hook is invoked during the patch process when a new virtual node
has been found. The hook is called before Snabbdom has processed the
node in any way. I.e., before it has created a DOM node based on the
vnode.

#### The `insert` hook

This hook is invoked once the DOM element for a vnode has been
inserted into the document _and_ the rest of the patch cycle is done.
This means that you can do DOM measurements (like using
[getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
in this hook safely, knowing that no elements will be changed
afterwards that could affect the position of the inserted elements.

#### The `remove` hook

Allows you to hook into the removal of an element. The hook is called
once a vnode is to be removed from the DOM. The handling function
receives both the vnode and a callback. You can control and delay the
removal with the callback. The callback should be invoked once the
hook is done doing its business, and the element will only be removed
once all `remove` hooks have invoked their callback.

The hook is only triggered when an element is to be removed from its
parent – not if it is the child of an element that is removed. For
that, see the `destroy` hook.

#### The `destroy` hook

This hook is invoked on a virtual node when its DOM element is removed
from the DOM or if its parent is being removed from the DOM.

To see the difference between this hook and the `remove` hook,
consider an example.

```mjs
const vnode1 = h("div", [h("div", [h("span", "Hello")])]);
const vnode2 = h("div", []);
patch(container, vnode1);
patch(vnode1, vnode2);
```

Here `destroy` is triggered for both the inner `div` element _and_ the
`span` element it contains. `remove`, on the other hand, is only
triggered on the `div` element because it is the only element being
detached from its parent.

You can, for instance, use `remove` to trigger an animation when an
element is being removed and use the `destroy` hook to additionally
animate the disappearance of the removed element's children.

### Creating modules

Modules works by registering global listeners for [hooks](#hooks). A module is simply a dictionary mapping hook names to functions.

```mjs
const myModule = {
  create: function (oldVnode, vnode) {
    // invoked whenever a new virtual node is created
  },
  update: function (oldVnode, vnode) {
    // invoked whenever a virtual node is updated
  },
};
```

With this mechanism you can easily augment the behaviour of Snabbdom.
For demonstration, take a look at the implementations of the default
modules.

## Modules documentation

This describes the core modules. All modules are optional. JSX examples assume you're using the [`jsx` pragma](#jsx) provided by this library.

### The class module

The class module provides an easy way to dynamically toggle classes on
elements. It expects an object in the `class` data property. The
object should map class names to booleans that indicates whether or
not the class should stay or go on the vnode.

```mjs
h("a", { class: { active: true, selected: false } }, "Toggle");
```

In JSX, you can use `class` like this:

```jsx
<div class={{ foo: true, bar: true }} />
// Renders as: <div class="foo bar"></div>
```

### The props module

Allows you to set properties on DOM elements.

```mjs
h("a", { props: { href: "/foo" } }, "Go to Foo");
```

In JSX, you can use `props` like this:

```jsx
<input props={{ name: "foo" }} />
// Renders as: <input name="foo" /> with input.name === "foo"
```

Properties can only be set. Not removed. Even though browsers allow addition and
deletion of custom properties, deletion will not be attempted by this module.
This makes sense, because native DOM properties cannot be removed. And
if you are using custom properties for storing values or referencing
objects on the DOM, then please consider using
[data-\* attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes)
instead. Perhaps via [the dataset module](#the-dataset-module).

### The attributes module

Same as props, but set attributes instead of properties on DOM elements.

```mjs
h("a", { attrs: { href: "/foo" } }, "Go to Foo");
```

In JSX, you can use `attrs` like this:

```jsx
<div attrs={{ "aria-label": "I'm a div" }} />
// Renders as: <div aria-label="I'm a div"></div>
```

Attributes are added and updated using `setAttribute`. In case of an
attribute that had been previously added/set and is no longer present
in the `attrs` object, it is removed from the DOM element's attribute
list using `removeAttribute`.

In the case of boolean attributes (e.g. `disabled`, `hidden`,
`selected` ...), the meaning doesn't depend on the attribute value
(`true` or `false`) but depends instead on the presence/absence of the
attribute itself in the DOM element. Those attributes are handled
differently by the module: if a boolean attribute is set to a
[falsy value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
(`0`, `-0`, `null`, `false`,`NaN`, `undefined`, or the empty string
(`""`)), then the attribute will be removed from the attribute list of
the DOM element.

### The dataset module

Allows you to set custom data attributes (`data-*`) on DOM elements. These can then be accessed with the [HTMLElement.dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset) property.

```mjs
h("button", { dataset: { action: "reset" } }, "Reset");
```

In JSX, you can use `dataset` like this:

```jsx
<div dataset={{ foo: "bar" }} />
// Renders as: <div data-foo="bar"></div>
```

### The style module

The style module is for making your HTML look slick and animate smoothly. At
its core it allows you to set CSS properties on elements.

```mjs
h(
  "span",
  {
    style: {
      border: "1px solid #bada55",
      color: "#c0ffee",
      fontWeight: "bold",
    },
  },
  "Say my name, and every colour illuminates"
);
```

In JSX, you can use `style` like this:

```jsx
<div
  style={{
    border: "1px solid #bada55",
    color: "#c0ffee",
    fontWeight: "bold",
  }}
/>
// Renders as: <div style="border: 1px solid #bada55; color: #c0ffee; font-weight: bold"></div>
```

#### Custom properties (CSS variables)

CSS custom properties (aka CSS variables) are supported, they must be prefixed
with `--`

```mjs
h(
  "div",
  {
    style: { "--warnColor": "yellow" },
  },
  "Warning"
);
```

#### Delayed properties

You can specify properties as being delayed. Whenever these properties
change, the change is not applied until after the next frame.

```mjs
h(
  "span",
  {
    style: {
      opacity: "0",
      transition: "opacity 1s",
      delayed: { opacity: "1" },
    },
  },
  "Imma fade right in!"
);
```

This makes it easy to declaratively animate the entry of elements.

The `all` value of `transition-property` is not supported.

#### Set properties on `remove`

Styles set in the `remove` property will take effect once the element
is about to be removed from the DOM. The applied styles should be
animated with CSS transitions. Only once all the styles are done
animating will the element be removed from the DOM.

```mjs
h(
  "span",
  {
    style: {
      opacity: "1",
      transition: "opacity 1s",
      remove: { opacity: "0" },
    },
  },
  "It's better to fade out than to burn away"
);
```

This makes it easy to declaratively animate the removal of elements.

The `all` value of `transition-property` is not supported.

#### Set properties on `destroy`

```mjs
h(
  "span",
  {
    style: {
      opacity: "1",
      transition: "opacity 1s",
      destroy: { opacity: "0" },
    },
  },
  "It's better to fade out than to burn away"
);
```

The `all` value of `transition-property` is not supported.

### The eventlisteners module

The event listeners module gives powerful capabilities for attaching
event listeners.

You can attach a function to an event on a vnode by supplying an
object at `on` with a property corresponding to the name of the event
you want to listen to. The function will be called when the event
happens and will be passed the event object that belongs to it.

```mjs
function clickHandler(ev) {
  console.log("got clicked");
}
h("div", { on: { click: clickHandler } });
```

In JSX, you can use `on` like this:

```js
<div on={{ click: clickHandler }} />
```

Snabbdom allows swapping event handlers between renders. This happens without
actually touching the event handlers attached to the DOM.

Note, however, that **you should be careful when sharing event
handlers between vnodes**, because of the technique this module uses
to avoid re-binding event handlers to the DOM. (And in general,
sharing data between vnodes is not guaranteed to work, because modules
are allowed to mutate the given data).

In particular, you should **not** do something like this:

```mjs
// Does not work
const sharedHandler = {
  change: function (e) {
    console.log("you chose: " + e.target.value);
  },
};
h("div", [
  h("input", {
    props: { type: "radio", name: "test", value: "0" },
    on: sharedHandler,
  }),
  h("input", {
    props: { type: "radio", name: "test", value: "1" },
    on: sharedHandler,
  }),
  h("input", {
    props: { type: "radio", name: "test", value: "2" },
    on: sharedHandler,
  }),
]);
```

For many such cases, you can use array-based handlers instead (described above).
Alternatively, simply make sure each node is passed unique `on` values:

```mjs
// Works
const sharedHandler = function (e) {
  console.log("you chose: " + e.target.value);
};
h("div", [
  h("input", {
    props: { type: "radio", name: "test", value: "0" },
    on: { change: sharedHandler },
  }),
  h("input", {
    props: { type: "radio", name: "test", value: "1" },
    on: { change: sharedHandler },
  }),
  h("input", {
    props: { type: "radio", name: "test", value: "2" },
    on: { change: sharedHandler },
  }),
]);
```

## SVG

SVG just works when using the `h` function for creating virtual
nodes. SVG elements are automatically created with the appropriate
namespaces.

```mjs
const vnode = h("div", [
  h("svg", { attrs: { width: 100, height: 100 } }, [
    h("circle", {
      attrs: {
        cx: 50,
        cy: 50,
        r: 40,
        stroke: "green",
        "stroke-width": 4,
        fill: "yellow",
      },
    }),
  ]),
]);
```

See also the [SVG example](./examples/svg) and the [SVG Carousel example](./examples/carousel-svg/).

### Classes in SVG Elements

Certain browsers (like IE &lt;=11) [do not support `classList` property in SVG elements](http://caniuse.com/#feat=classlist).
Because the _class_ module internally uses `classList`, it will not work in this case unless you use a [classList polyfill](https://www.npmjs.com/package/classlist-polyfill).
(If you don't want to use a polyfill, you can use the `class` attribute with the _attributes_ module).

## Thunks

The `thunk` function takes a selector, a key for identifying a thunk,
a function that returns a vnode and a variable amount of state
parameters. If invoked, the render function will receive the state
arguments.

`thunk(selector, key, renderFn, [stateArguments])`

The `renderFn` is invoked only if the `renderFn` is changed or `[stateArguments]` array length or it's elements are changed.

The `key` is optional. It should be supplied when the `selector` is
not unique among the thunks siblings. This ensures that the thunk is
always matched correctly when diffing.

Thunks are an optimization strategy that can be used when one is
dealing with immutable data.

Consider a simple function for creating a virtual node based on a number.

```mjs
function numberView(n) {
  return h("div", "Number is: " + n);
}
```

The view depends only on `n`. This means that if `n` is unchanged,
then creating the virtual DOM node and patching it against the old
vnode is wasteful. To avoid the overhead we can use the `thunk` helper
function.

```mjs
function render(state) {
  return thunk("num", numberView, [state.number]);
}
```

Instead of actually invoking the `numberView` function this will only
place a dummy vnode in the virtual tree. When Snabbdom patches this
dummy vnode against a previous vnode, it will compare the value of
`n`. If `n` is unchanged it will simply reuse the old vnode. This
avoids recreating the number view and the diff process altogether.

The view function here is only an example. In practice thunks are only
relevant if you are rendering a complicated view that takes
significant computational time to generate.

## JSX

Note that JSX fragments are still experimental and must be opted in.
See [`fragment`](#fragment-experimental) section for details.

### TypeScript

Add the following options to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "jsx",
    "jsxFragmentFactory": "Fragment"
  }
}
```

Then make sure that you use the `.tsx` file extension and import the `jsx` function and the `Fragment` function at the top of the file:

```tsx
import { Fragment, jsx, VNode } from "snabbdom";

const node: VNode = (
  <div>
    <span>I was created with JSX</span>
  </div>
);

const fragment: VNode = (
  <>
    <span>JSX fragments</span>
    are experimentally supported
  </>
);
```

### Babel

Add the following options to your babel configuration:

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "pragma": "jsx",
        "pragmaFrag": "Fragment"
      }
    ]
  ]
}
```

Then import the `jsx` function and the `Fragment` function at the top of the file:

```jsx
import { Fragment, jsx } from "snabbdom";

const node = (
  <div>
    <span>I was created with JSX</span>
  </div>
);

const fragment = (
  <>
    <span>JSX fragments</span>
    are experimentally supported
  </>
);
```

## Virtual Node

**Properties**

- [sel](#sel--string)
- [data](#data--object)
- [children](#children--array)
- [text](#text--string)
- [elm](#elm--element)
- [key](#key--string--number)

### sel : String

The `.sel` property of a virtual node is the CSS selector passed to
[`h()`](#snabbdomh) during creation. For example: `h('div#container', {}, [...])` will create a a virtual node which has `div#container` as
its `.sel` property.

### data : Object

The `.data` property of a virtual node is the place to add information
for [modules](#modules-documentation) to access and manipulate the
real DOM element when it is created; Add styles, CSS classes,
attributes, etc.

The data object is the (optional) second parameter to [`h()`](#snabbdomh)

For example `h('div', {props: {className: 'container'}}, [...])` will produce a virtual node with

```mjs
({
  props: {
    className: "container",
  },
});
```

as its `.data` object.

### children : Array<vnode>

The `.children` property of a virtual node is the third (optional)
parameter to [`h()`](#snabbdomh) during creation. `.children` is
simply an Array of virtual nodes that should be added as children of
the parent DOM node upon creation.

For example `h('div', {}, [ h('h1', {}, 'Hello, World') ])` will
create a virtual node with

```mjs
[
  {
    sel: "h1",
    data: {},
    children: undefined,
    text: "Hello, World",
    elm: Element,
    key: undefined,
  },
];
```

as its `.children` property.

### text : string

The `.text` property is created when a virtual node is created with
only a single child that possesses text and only requires
`document.createTextNode()` to be used.

For example: `h('h1', {}, 'Hello')` will create a virtual node with
`Hello` as its `.text` property.

### elm : Element

The `.elm` property of a virtual node is a pointer to the real DOM
node created by snabbdom. This property is very useful to do
calculations in [hooks](#hooks) as well as
[modules](#modules-documentation).

### key : string | number

The `.key` property is created when a key is provided inside of your
[`.data`](#data--object) object. The `.key` property is used to keep
pointers to DOM nodes that existed previously to avoid recreating them
if it is unnecessary. This is very useful for things like list
reordering. A key must be either a string or a number to allow for
proper lookup as it is stored internally as a key/value pair inside of
an object, where `.key` is the key and the value is the
[`.elm`](#elm--element) property created.

If provided, the `.key` property must be unique among sibling elements.

For example: `h('div', {key: 1}, [])` will create a virtual node
object with a `.key` property with the value of `1`.

## Structuring applications

Snabbdom is a low-level virtual DOM library. It is unopinionated with
regards to how you should structure your application.

Here are some approaches to building applications with Snabbdom.

- [functional-frontend-architecture](https://github.com/paldepind/functional-frontend-architecture) –
  a repository containing several example applications that
  demonstrates an architecture that uses Snabbdom.
- [Cycle.js](https://cycle.js.org/) –
  "A functional and reactive JavaScript framework for cleaner code"
  uses Snabbdom
- [Vue.js](http://vuejs.org/) use a fork of snabbdom.
- [scheme-todomvc](https://github.com/amirouche/scheme-todomvc/) build
  redux-like architecture on top of snabbdom bindings.
- [kaiju](https://github.com/AlexGalays/kaiju) -
  Stateful components and observables on top of snabbdom
- [Tweed](https://tweedjs.github.io) –
  An Object Oriented approach to reactive interfaces.
- [Cyclow](http://cyclow.js.org) -
  "A reactive frontend framework for JavaScript"
  uses Snabbdom
- [Tung](https://github.com/Reon90/tung) –
  A JavaScript library for rendering html. Tung helps to divide html and JavaScript development.
- [sprotty](https://github.com/theia-ide/sprotty) - "A web-based diagramming framework" uses Snabbdom.
- [Mark Text](https://github.com/marktext/marktext) - "Realtime preview Markdown Editor" build on Snabbdom.
- [puddles](https://github.com/flintinatux/puddles) -
  "Tiny vdom app framework. Pure Redux. No boilerplate." - Built with :heart: on Snabbdom.
- [Backbone.VDOMView](https://github.com/jcbrand/backbone.vdomview) - A [Backbone](http://backbonejs.org/) View with VirtualDOM capability via Snabbdom.
- [Rosmaro Snabbdom starter](https://github.com/lukaszmakuch/rosmaro-snabbdom-starter) - Building user interfaces with state machines and Snabbdom.
- [Pureact](https://github.com/irony/pureact) - "65 lines implementation of React incl Redux and hooks with only one dependency - Snabbdom"
- [Snabberb](https://github.com/tobymao/snabberb) - A minimalistic Ruby framework using [Opal](https://github.com/opal/opal) and Snabbdom for building reactive views.
- [WebCell](https://github.com/EasyWebApp/WebCell) - Web Components engine based on JSX & TypeScript

Be sure to share it if you're building an application in another way
using Snabbdom.

## Common errors

```text
Uncaught NotFoundError: Failed to execute 'insertBefore' on 'Node':
    The node before which the new node is to be inserted is not a child of this node.
```

The reason for this error is reusing of vnodes between patches (see code example), snabbdom stores actual dom nodes inside the virtual dom nodes passed to it as performance improvement, so reusing nodes between patches is not supported.

```mjs
const sharedNode = h("div", {}, "Selected");
const vnode1 = h("div", [
  h("div", {}, ["One"]),
  h("div", {}, ["Two"]),
  h("div", {}, [sharedNode]),
]);
const vnode2 = h("div", [
  h("div", {}, ["One"]),
  h("div", {}, [sharedNode]),
  h("div", {}, ["Three"]),
]);
patch(container, vnode1);
patch(vnode1, vnode2);
```

You can fix this issue by creating a shallow copy of the object (here with object spread syntax):

```mjs
const vnode2 = h("div", [
  h("div", {}, ["One"]),
  h("div", {}, [{ ...sharedNode }]),
  h("div", {}, ["Three"]),
]);
```

Another solution would be to wrap shared vnodes in a factory function:

```mjs
const sharedNode = () => h("div", {}, "Selected");
const vnode1 = h("div", [
  h("div", {}, ["One"]),
  h("div", {}, ["Two"]),
  h("div", {}, [sharedNode()]),
]);
```

## Opportunity for community feedback

Pull requests that the community may care to provide feedback on should be
merged after such opportunity of a few days was provided.
