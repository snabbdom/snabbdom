<img alt="Snabbdom" src="readme-title.svg" width="356px">

A virtual DOM library with focus on simplicity, modularity, powerful features
and performance.

一个精简化、模块化、功能强大、性能卓越的虚拟 DOM 库

---

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/snabbdom/snabbdom.svg?branch=master)](https://travis-ci.org/snabbdom/snabbdom)
[![npm version](https://badge.fury.io/js/snabbdom.svg)](https://badge.fury.io/js/snabbdom)
[![npm downloads](https://img.shields.io/npm/dm/snabbdom.svg)](https://www.npmjs.com/package/snabbdom)
[![Join the chat at https://gitter.im/snabbdom/snabbdom](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/snabbdom/snabbdom?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Donate to our collective](https://opencollective.com/snabbdom/donate/button@2x.png?color=blue)](https://opencollective.com/snabbdom#section-contribute)

Thanks to [Browserstack](https://www.browserstack.com/) for providing access to
their great cross-browser testing tools.

---

## 介绍

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

虚拟DOM非常有趣，他允许我们以对象的形式来表达程序视图，但现有的解决方式基本都过于臃肿、性能不佳、功能缺乏、API偏向于OOP或者缺少一些我所需要的功能。

Snabbdom 则极其简单、高效并且可拓展，同时核心代码仅200行。我们提供了一个具有丰富功能同时支持自定义拓展的模块化结构。为了使核心代码更简洁，所有非必要的功能都将模块化引入。

你可以将 Snabbdom 改造成任何你想要的样子！选择或自定义任何你需要的功能。如果嫌麻烦的话可以使用默认配置，便能获得一个高性能、体积小、拥有下列所有特性的虚拟 DOM 库。

## 特性

- 主要特点
  - About 200 SLOC – you could easily read through the entire core and fully
    understand how it works.
  - 200行 - 你可以通过简单地阅读所有核心代码来充分理解其工作原理。
  - Extendable through modules.
  - 通过模块化实现可拓展。
  - A rich set of hooks available, both per vnode and globally for modules,
    to hook into any part of the diff and patch process.
  - 对于vnode和全局模块都提供了 hook，你可以在 patch 过程或者其他地方调用 hook。
  - Splendid performance. Snabbdom is among the fastest virtual DOM libraries.
  - 性能卓越：Snabbdom 是目前最高效的虚拟DOM库之一。
  - Patch function with a function signature equivalent to a reduce/scan
    function. Allows for easier integration with a FRP library.
  - Patch 函数有一个相当于 reduce/scan 函数的函数签名，这将更容易集成其他函数式库。
- 模块特点
  - `h` function for easily creating virtual DOM nodes.
  - 函数`h`： 通过该创建虚拟 DOM 节点
  - [SVG _just works_ with the `h` helper](#svg).
  - [SVG 需要与 `h` 函数结合使用](#svg)
  - Features for doing complex CSS animations.
  - 支持复杂的CSS动画实现
  - Powerful event listener functionality.
  - 提供强大的事件监听功能
  - [Thunks](#thunks) to optimize the diff and patch process even further.
  - 通过 [Thunks](#thunks) 进一步优化 diff 和 patch 过程
  - [JSX support, including TypeScript types](#jsx)
  - [支持 JSX 及 Typrscript ](#jsx)
- 第三方功能
  - Server-side HTML output provided by [snabbdom-to-html](https://github.com/acstll/snabbdom-to-html).
  -  [snabbdom-to-html](https://github.com/acstll/snabbdom-to-html) 提供服务端渲染功能
  - Compact virtual DOM creation with [snabbdom-helpers](https://github.com/krainboltgreene/snabbdom-helpers).
  -  [snabbdom-helpers](https://github.com/krainboltgreene/snabbdom-helpers) 精简版虚拟DOM创建
  - Template string support using [snabby](https://github.com/jamen/snabby).
  -  [snabby](https://github.com/jamen/snabby) 提供 HTML 模板字符串支持
  - Virtual DOM assertion with [snabbdom-looks-like](https://github.com/jvanbruegge/snabbdom-looks-like)
  -  [snabbdom-looks-like](https://github.com/jvanbruegge/snabbdom-looks-like) 提供虚拟 DOM 断言

## 示例

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
  // 通过传入模块初始化 patch 函数
  classModule, // 开启 classes 功能
  propsModule, // 支持传入 props
  styleModule, // 支持内联样式同时支持动画
  eventListenersModule, // 添加事件监听
]);

const container = document.getElementById("container");

const vnode = h("div#container.two.classes", { on: { click: someFn } }, [
  h("span", { style: { fontWeight: "bold" } }, "This is bold"),
  " and this is just normal text",
  h("a", { props: { href: "/foo" } }, "I'll take you places!"),
]);
// 传入一个空的元素节点 - 将产生副作用（修改该节点）
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
// 再次调用 `patch` 
patch(vnode, newVnode); // 将旧节点更新为新节点
```

## 更多示例

- [Animated reordering of elements](http://snabbdom.github.io/snabbdom/examples/reorder-animation/)
- [Hero transitions](http://snabbdom.github.io/snabbdom/examples/hero/)
- [SVG Carousel](http://snabbdom.github.io/snabbdom/examples/carousel-svg/)

---

## 仙人指路

- [核心功能](#核心功能)
  - [`init`](#init)
  - [`patch`](#patch)
    - [卸载](#卸载)
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

## 核心功能

The core of Snabbdom provides only the most essential functionality.
It is designed to be as simple as possible while still being fast and
extendable.

 Snabbdom 仅提供通用的核心部分，这种设计保证了核心代码的纯粹，与此同时又使其更快并且对可拓展性提供更好的支持

### `init`

The core exposes only one single function `init`. This `init`
takes a list of modules and returns a `patch` function that uses the
specified set of modules.

核心功能暴露一个 `init` 函数，这个 `init` 函数接收一个包含模块的数组并返回一个具有指定功能的 `patch` 函数 

```mjs
import { init, classModule, styleModule } from "snabbdom";

const patch = init([classModule, styleModule]);
```

### `patch`

The `patch` function returned by `init` takes two arguments. The first
is a DOM element or a vnode representing the current view. The second
is a vnode representing the new, updated view.

通过调用 `init` 函数返回的 `patch` 函数具有两个参数:

1. 一个 DOM 元素 或者 一个表示当前视图的 `vnode` 元素
2. 一个表示新的、需要更新的 `vnode` 元素

If a DOM element with a parent is passed, `newVnode` will be turned
into a DOM node, and the passed element will be replaced by the
created DOM node. If an old vnode is passed, Snabbdom will efficiently
modify it to match the description in the new vnode.

如果第一个参数传入一个包含父节点的 DOM 元素，那么 `newVnode`  将转换为一个 DOM 节点并替换传入的元素。如果第一个参数传入的是一个 `vnode` 则根据新的 `vnode` 相关描述进行修改

Any old vnode passed must be the resulting vnode from a previous call
to `patch`. This is necessary since Snabbdom stores information in the
vnode. This makes it possible to implement a simpler and more
performant architecture. This also avoids the creation of a new old
vnode tree.

所有传入的 `oldvnode` 都必须被传入过 `patch` 函数， 因为 Snabbdom 将信息存储在 vnode 中， 这避免了重复创建新的 vnode 树

```mjs
patch(oldVnode, newVnode);
```

#### 卸载

While there is no API specifically for removing a VNode tree from its mount point element, one way of almost achieving this is providing a comment VNode as the second argument to `patch`, such as:

虽然没有专门为移除 vnode 树中的节点提供 API，但是依然可以通过给 `patch` 函数传入一个 html注释vnode 作为第二个参数来实现相同的效果，如：

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

当然，那里依然会有一个注释节点被挂载

### `h`

It is recommended that you use `h` to create vnodes. It accepts a
tag/selector as a string, an optional data object and an optional string or
array of children.

我们推荐您使用函数 `h` 来创建 vnodes，这个函数接收一个字符串类型的 tag/selector、一个数据对象（可选）、一个子节点数组或字符串（可选）

```mjs
import { h } from "snabbdom";

const vnode = h("div", { style: { color: "#000" } }, [
  h("h1", "Headline"),
  h("p", "A paragraph"),
]);
```

### `fragment` (试验性)

Caution: This feature is currently experimental and must be opted in.
Its API may be changed without an major version bump.

警告：此功能目前处于试验阶段必须手动开启，并且这个API可能会在未来小版本更新中被修改

```mjs
const patch = init(modules, undefined, {
  experimental: {
    fragments: true,
  },
});
```

Creates a virtual node that will be converted to a document fragment containing the given children.

创建一个虚拟节点并转换为一个包含子元素的 document fragment（文档碎片）

```mjs
import { fragment, h } from "snabbdom";

const vnode = fragment(["I am", h("span", [" a", " fragment"])]);
```

### `tovnode`

Converts a DOM node into a virtual node. Especially good for patching over an pre-existing,
server-side generated content.

将一个DOM节点转换为一个虚拟节点，这非常有利于服务端渲染

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

Snabbdom 提供了一系列丰富的生命周期函数，这些生命周期函数适用于拓展 Snabbdom 模块或者在 virtual node 生命周期中的任意节点执行任意代码

#### 概览

| 名称        | 触发节点                         | 回调参数                |
| ----------- | -------------------------------- | ----------------------- |
| `pre`       | patch 开始执行                   | none                    |
| `init`      | vnode 被添加                     | `vnode`                 |
| `create`    | 一个基于 vnode 的 DOM 元素被创建 | `emptyVnode, vnode`     |
| `insert`    | 元素被插入到 DOM                 | `vnode`                 |
| `prepatch`  | 元素即将 patch                   | `oldVnode, vnode`       |
| `update`    | 元素已更新                       | `oldVnode, vnode`       |
| `postpatch` | 元素已被 patch                   | `oldVnode, vnode`       |
| `destroy`   | 元素被直接或间接得移除           | `vnode`                 |
| `remove`    | 元素已从 DOM 中移除              | `vnode, removeCallback` |
| `post`      | 已完成 patch 过程                | none                    |

The following hooks are available for modules: `pre`, `create`,
`update`, `destroy`, `remove`, `post`.

适用于模块：`pre`, `create`,`update`, `destroy`, `remove`, `post`.

The following hooks are available in the `hook` property of individual
elements: `init`, `create`, `insert`, `prepatch`, `update`,
`postpatch`, `destroy`, `remove`.

适用于单个元素：`init`, `create`, `insert`, `prepatch`, `update`,`postpatch`, `destroy`, `remove`

#### 使用

To use hooks, pass them as an object to `hook` field of the data
object argument.

使用 hooks 时， 请将所需要的 `hook` 以对象的形式（key 为对应 `hook` 字段）作为参数传入

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

这个钩子函数会在新的 vnode 创建后被调用，在 Snabbdom 以任何方式处理该节点前被调用，即：在 `create` 之前被调用

#### The `insert` hook

This hook is invoked once the DOM element for a vnode has been
inserted into the document _and_ the rest of the patch cycle is done.
This means that you can do DOM measurements (like using
[getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
in this hook safely, knowing that no elements will be changed
afterwards that could affect the position of the inserted elements.

当基于 vnode 的 元素被插入到文档后并且 patch 其余过程完成后调用，这意味着你可以在这个 `hook` 中更可靠地计算元素位置坐标信息（如：[getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)），这种操作不会影响任何被插入元素的位置

#### The `remove` hook

Allows you to hook into the removal of an element. The hook is called
once a vnode is to be removed from the DOM. The handling function
receives both the vnode and a callback. You can control and delay the
removal with the callback. The callback should be invoked once the
hook is done doing its business, and the element will only be removed
once all `remove` hooks have invoked their callback.

一旦从 DOM 中移除了 vnode 就会调用该函数，函数需要传入 vnode 和 回调函数 作为参数，你可以通过回调来控制或延迟移除，这个回调函数将会在 hook 执行完成后调用，需要注意的是只有当所有 `remove` hooks 执行完所有回调之后元素才会被一次性删除

The hook is only triggered when an element is to be removed from its
parent – not if it is the child of an element that is removed. For
that, see the `destroy` hook.

这个 hook 只有在当前元素从父级中删除才会触发，从元素中移除子元素则不会触发

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

Note that the style module does not remove style attributes if they
are removed as properties from the style object. To remove a style,
you should instead set it to the empty string.

```mjs
h(
  "div",
  {
    style: { position: shouldFollow ? "fixed" : "" },
  },
  "I, I follow, I follow you"
);
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

### TypeScript

Add the following options to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "jsx"
  }
}
```

Then make sure that you use the `.tsx` file extension and import the `jsx` function at the top of the file:

```tsx
import { jsx, VNode } from "snabbdom";

const node: VNode = (
  <div>
    <span>I was created with JSX</span>
  </div>
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
        "pragma": "jsx"
      }
    ]
  ]
}
```

Then import the `jsx` function at the top of the file:

```jsx
import { jsx } from "snabbdom";

const node = (
  <div>
    <span>I was created with JSX</span>
  </div>
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
