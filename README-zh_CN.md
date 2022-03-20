<img alt="Snabbdom" src="readme-title.svg" width="356px">

一个精简化、模块化、功能强大、性能卓越的虚拟 DOM 库

---

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/snabbdom/snabbdom/actions/workflows/steps.yml/badge.svg)](https://github.com/snabbdom/snabbdom/actions/workflows/steps.yml)
[![npm version](https://badge.fury.io/js/snabbdom.svg)](https://badge.fury.io/js/snabbdom)
[![npm downloads](https://img.shields.io/npm/dm/snabbdom.svg)](https://www.npmjs.com/package/snabbdom)
[![Join the chat at https://gitter.im/snabbdom/snabbdom](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/snabbdom/snabbdom?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Donate to our collective](https://opencollective.com/snabbdom/donate/button@2x.png?color=blue)](https://opencollective.com/snabbdom#section-contribute)

感谢 [Browserstack](https://www.browserstack.com/) 对跨浏览器测试提供支持

---

## 介绍

虚拟 DOM 非常有趣，他允许我们以函数的形式来表达程序视图，但现有的解决方式基本都过于臃肿、性能不佳、功能缺乏、API 偏向于 OOP 或者缺少一些我所需要的功能。

Snabbdom 则极其简单、高效并且可拓展，同时核心代码 ≈ 200 行。我们提供了一个具有丰富功能同时支持自定义拓展的模块化结构。为了使核心代码更简洁，所有非必要的功能都将模块化引入。

你可以将 Snabbdom 改造成任何你想要的样子！选择或自定义任何你需要的功能。或者使用默认配置，便能获得一个高性能、体积小、拥有下列所有特性的虚拟 DOM 库。

## 特性

- 主要特点
  - 200 行 - 你可以通过简单地阅读所有核心代码来充分理解其工作原理
  - 通过模块化实现可拓展
  - 对于 vnode 和全局模块都提供了 hook，你可以在 patch 过程或者其他地方调用 hook
  - 性能卓越：Snabbdom 是目前最高效的虚拟 DOM 库之一
  - Patch 函数有一个相当于 reduce/scan 函数的函数声明，这将更容易集成其他函数式库
- 模块特点
  - 函数`h`： 轻松创建虚拟 DOM 节点
  - [SVG 需要与 `h` 函数结合使用](#svg)
  - 支持复杂的 CSS 动画实现
  - 提供强大的事件监听功能
  - 通过 [Thunks](#thunks) 进一步优化 diff 和 patch 过程
  - [支持 JSX 及 Typrscript ](#jsx)
- 第三方功能
  - [snabbdom-to-html](https://github.com/acstll/snabbdom-to-html) 提供服务端渲染功能
  - [snabbdom-helpers](https://github.com/krainboltgreene/snabbdom-helpers) 精简版虚拟 DOM 创建
  - [snabby](https://github.com/jamen/snabby) 提供 HTML 模板字符串支持
  - [snabbdom-looks-like](https://github.com/jvanbruegge/snabbdom-looks-like) 提供虚拟 DOM 断言

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

## 目录

- [核心功能](#%E6%A0%B8%E5%BF%83%E5%8A%9F%E8%83%BD)
  - [`init`](#init)
  - [`patch`](#patch)
    - [卸载](#%E5%8D%B8%E8%BD%BD)
  - [`h`](#h)
  - [`fragment` (试验性)](#fragment-%E8%AF%95%E9%AA%8C%E6%80%A7)
  - [`tovnode`](#tovnode)
  - [Hooks](#hooks)
    - [概览](#%E6%A6%82%E8%A7%88)
    - [使用](#%E4%BD%BF%E7%94%A8)
    - [`init`](#init-1)
    - [`insert`](#insert)
    - [`remove`](#remove)
    - [`destroy`](#destroy)
  - [创建模块](#%E5%88%9B%E5%BB%BA%E6%A8%A1%E5%9D%97)
- [模块文档](#%E6%A8%A1%E5%9D%97%E6%96%87%E6%A1%A3)
  - [class 模块](#class-%E6%A8%A1%E5%9D%97)
  - [props 模块](#props-%E6%A8%A1%E5%9D%97)
  - [attributes 模块](#attributes-%E6%A8%A1%E5%9D%97)
  - [dataset 模块](#dataset-%E6%A8%A1%E5%9D%97)
  - [style 模块](#style-%E6%A8%A1%E5%9D%97)
    - [自定义属性(CSS 变量)](#%E8%87%AA%E5%AE%9A%E4%B9%89%E5%B1%9E%E6%80%A7css%E5%8F%98%E9%87%8F)
    - [`delayed`](#delayed)
    - [`remove`](#remove-1)
    - [`destroy`](#destroy-1)
  - [eventlisteners 模块](#eventlisteners-%E6%A8%A1%E5%9D%97)
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
- [构建应用程序](#%E6%9E%84%E5%BB%BA%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F)
- [常见错误](#%E5%B8%B8%E8%A7%81%E9%94%99%E8%AF%AF)
- [社区反馈](#%E7%A4%BE%E5%8C%BA%E5%8F%8D%E9%A6%88)

## 核心功能

Snabbdom 仅提供通用的核心部分，这种设计保证了核心代码的纯粹，与此同时又使其更快并且对可拓展性提供更好的支持。

### `init`

核心功能暴露一个 `init` 函数， `init` 函数接收一个包含模块的数组并返回一个具有指定功能的 `patch` 函数 。

```mjs
import { init, classModule, styleModule } from "snabbdom";

const patch = init([classModule, styleModule]);
```

### `patch`

通过调用 `init` 函数返回的 `patch` 函数接收两个参数：

1. 一个 DOM 元素或者 一个表示当前视图的 `vnode`
2. 一个表示新的、需要更新的 `vnode`

如果第一个参数传入一个包含父节点的 DOM 元素，那么新的 vnode 将转换为一个 DOM 节点并替换传入的元素。如果第一个参数传入的是一个 `vnode` 则根据新的 `vnode` 相关描述进行修改。

所有传入的 `oldvnode` 都必须被传入过 `patch` 函数， 因为 Snabbdom 将信息存储在 vnode 中， 这避免了重复创建新的 vnode 树。

```mjs
patch(oldVnode, newVnode);
```

#### 卸载

虽然没有专门为移除 vnode 树中的节点提供 API，但是依然可以通过给 `patch` 函数传入一个 HTML 注释的 vnode 作为第二个参数来实现相同的效果，如：

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

当然，那里依然会有一个注释节点被挂载。

### `h`

我们推荐您使用函数 `h` 来创建 vnodes，这个函数接收一个字符串类型的 标签或选择器、一个数据对象（可选）、一个子节点数组或字符串（可选）。

```mjs
import { h } from "snabbdom";

const vnode = h("div", { style: { color: "#000" } }, [
  h("h1", "Headline"),
  h("p", "A paragraph"),
]);
```

### `fragment` (试验性)

警告：此功能目前处于试验阶段必须手动开启，并且这个 API 可能会在未来小版本更新中被修改。

```mjs
const patch = init(modules, undefined, {
  experimental: {
    fragments: true,
  },
});
```

创建一个虚拟节点并转换为一个包含子元素的 document fragment（文档碎片）。

```mjs
import { fragment, h } from "snabbdom";

const vnode = fragment(["I am", h("span", [" a", " fragment"])]);
```

### `tovnode`

将一个 DOM 节点转换为一个虚拟节点，这非常有利于服务端渲染。

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

Snabbdom 提供了一系列丰富的生命周期函数，这些生命周期函数适用于拓展 Snabbdom 模块或者在虚拟节点生命周期中执行任意代码。

#### 概览

| 名称        | 触发节点                         | 回调参数                |
| ----------- | -------------------------------- | ----------------------- |
| `pre`       | patch 开始执行                   | none                    |
| `init`      | vnode 被添加                     | `vnode`                 |
| `create`    | 一个基于 vnode 的 DOM 元素被创建 | `emptyVnode, vnode`     |
| `insert`    | 元素 被插入到 DOM                | `vnode`                 |
| `prepatch`  | 元素 即将 patch                  | `oldVnode, vnode`       |
| `update`    | 元素 已更新                      | `oldVnode, vnode`       |
| `postpatch` | 元素 已被 patch                  | `oldVnode, vnode`       |
| `destroy`   | 元素 被直接或间接得移除          | `vnode`                 |
| `remove`    | 元素 已从 DOM 中移除             | `vnode, removeCallback` |
| `post`      | 已完成 patch 过程                | none                    |

适用于模块：`pre`, `create`,`update`, `destroy`, `remove`, `post`

适用于单个元素：`init`, `create`, `insert`, `prepatch`, `update`,`postpatch`, `destroy`, `remove`

#### 使用

使用 hooks 时， 请将所需要的 `hook` 以对象的形式（key 为对应 `hook` 字段）作为参数传入。

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

#### `init`

这个钩子函数会在新的 vnode 创建后被调用并在 Snabbdom 以任何方式处理该节点前被调用，即：在 `create` 之前被调用。

#### `insert`

当基于 vnode 的 DOM 元素被插入到 DOM 后并且 patch 其余过程完成后调用，这意味着你可以在这个 `hook` 中更可靠地计算元素位置坐标信息（如：[getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)），这种操作不会影响任何被插入元素的位置。

#### `remove`

一旦从 DOM 中移除了 vnode 就会调用该函数，函数传入两个参数 vnode 和 回调函数，你可以通过回调来控制或延迟移除，这个回调函数将会在 hook 执行完成后调用，需要注意的是只有当所有 `remove` 钩子函数执行回调之后元素才会被一次性删除（即：回调必须执行否则元素不会删除）。

这个 hook 只有在当前元素从它的父级中删除才会触发，被移除的元素中的子元素则不会触发。为此，我们提供了 `destroy` 钩子函数。

#### `destroy`

当虚拟节点的 DOM 元素从 DOM 中移除或者元素父级从 DOM 中移除时都将调用该 hook。

要知道这个 hook 和 `remove` hook 的区别，先看看这个示例

```mjs
const vnode1 = h("section", [
  h(
    "div",
    {
      hook: {
        remove: (vnode, cb) => {
          console.log(vnode);
          cb();
        },
      },
    },
    [h("span", "Hello")]
  ),
]);
const vnode2 = h("section", []);
patch(container, vnode1);
patch(vnode1, vnode2);
```

这里内部 `div` 元素及其包含的 `span` 元素都会触发 `destroy`， 另一方面，`remove` 则只会在 `div` 上触发，因为他是唯一一个直接脱离父级的元素，也就是说，对于 `section` 来说这个 `div` 是它的二级节点，那么就只有二级节点移除会触发 `remove`。

比如，你可以使用 `remove` 在元素被移除时触发动画，再使用 `destroy` 为子元素添加消失动画。

### 创建模块

模块是通过全局注册 hook 监听实现，一个模块就相当于是 hook 的映射。

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

通过这种方法你可以很容易得增加 Snabbdom 的行为。为了更好的展示，请查看默认模块的实现。

## 模块文档

本章节将描述核心模块，所有模块都是可选的，关于 JSX 示例我们将假定你使用的 [`jsx` pragma](#jsx) 与本库一致。

### class 模块

class 模块提供了一种简单的方式来动态配置元素的 class 属性，这个模块值为一个对象形式的 class 数据，对象中类名需要映射为布尔值，以此来表示该类名是否应该出现在节点上。

```mjs
h("a", { class: { active: true, selected: false } }, "Toggle");
```

在 JSX 中，你可以这样使用 `class`：

```jsx
<div class={{ foo: true, bar: true }} />
// Renders as: <div class="foo bar"></div>
```

### props 模块

该模块允许你设置 DOM 元素的属性。

```mjs
h("a", { props: { href: "/foo" } }, "Go to Foo");
```

在 JSX 中，你可以这样使用 `props`：

```jsx
<input props={{ name: "foo" }} />
// Renders as: <input name="foo" /> with input.name === "foo"
```

属性只能被设置不能被移除，即使浏览器允许自定义添加或删除属性，该模块也不会尝试删除。这是因为原生 DOM 的属性也同样不支持被移除，如果你是通过自定义属性来存储信息或者引用对象，那么请考虑使用 [data-\* attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) 代替，为此我们提供了 [dataset](#dataset-%E6%A8%A1%E5%9D%97) 模块。

### attributes 模块

与 props 相同，但是是使用 attr 替代 prop。

```mjs
h("a", { attrs: { href: "/foo" } }, "Go to Foo");
```

在 JSX 中，你可以这样使用 `attrs`：

```jsx
<div attrs={{ "aria-label": "I'm a div" }} />
// Renders as: <div aria-label="I'm a div"></div>
```

Attr 通过 `setAttribute` 实现添加及更新操作，对于已经添加过的属性，如果该属性不存在于 `attrs` 对象中那么将通过 `removeAttribute` 将其从 DOM 元素的 attribute 列表中移除。

对于布尔值属性（如：`disabled`, `hidden`,`selected` ...），这一类属性并不依赖于 Attr 的值(`true` 或 `false`)，而是取决于 DOM 元素本身是否存在该属性。模块对于这类属性的处理方式有些许不同，当一个布尔值属性被赋为 [假值](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean) (`0`, `-0`, `null`, `false`,`NaN`, `undefined`, or the empty string(`""`))，那么该属性同样会直接从 DOM 元素的 attribute 列表中移除。

### dataset 模块

这个模块允许你在 DOM 元素上设置自定义 data 属性，然后通过 [HTMLElement.dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset) 来访问这些属性。

```mjs
h("button", { dataset: { action: "reset" } }, "Reset");
```

在 JSX 中，你可以这样使用 `dataset`：

```jsx
<div dataset={{ foo: "bar" }} />
// Renders as: <div data-foo="bar"></div>
```

### style 模块

style 模块用于让动画更加平滑，它的核心是允许你再元素上设置 CSS 属性。

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

在 JSX 中，你可以这样使用 `style`：

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

#### 自定义属性(CSS 变量)

已支持 CSS 自定义属性（又称 CSS 变量或者级联变量），属性名需要以 `--` 为前缀。

```mjs
h(
  "div",
  {
    style: { "--warnColor": "yellow" },
  },
  "Warning"
);
```

#### `delayed`

你可以指定延迟参数，每当这些属性变动时需要到下一帧之后才会应用更改。

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

这使得声明方式设置元素入场动画变得容易。

不支持 `transition-property` 的所有值。

#### `remove`

设置到 `remove` 中的样式属性将会在元素即将从 DOM 中移除时生效，应用的样式应该通过 CSS transition 设置，只有当所有动画执行完成后元素才会从 DOM 中移除。

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

这使得声明方式设置元素出场动画变得容易。

不支持 `transition-property` 的所有值。

#### `destroy`

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

不支持 `transition-property` 的所有值。

### eventlisteners 模块

eventlisteners 模块提供了一个功能强大的事件监听器。

你可以通过给 `on` 提供一个对象以此来将事件函数绑定到 vnode 上，对象包含你要监听的事件名称和对应函数，函数将会在事件发生时触发并传递相应的事件对象。

```mjs
function clickHandler(ev) {
  console.log("got clicked");
}
h("div", { on: { click: clickHandler } });
```

在 JSX 中，你可以这样使用 `on`：

```js
<div on={{ click: clickHandler }} />
```

Snabbdom 允许在 renders 之间交换事件处理，这种情况发生时并没有实际触发 DOM 的事件处理。

但是，当你在 vnode 之间共享事件函数时需要谨慎一点，因为从技术层面上我们避免了事件处理函数重复绑定到 DOM 上。（总的来说，我们无法保证在 vnode 间共享数据一定能正常工作，因为模块允许对给定的数据进行修改）。

## SVG

SVG 需要与 `h` 函数配合使用，使用恰当的命名来自动创建 SVG 元素。

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

更多示例： [SVG example](./examples/svg) 、 [SVG Carousel example](./examples/carousel-svg/)。

### Classes in SVG Elements

某些浏览器（如 IE<=11）[不支持 SVG 元素中的 `classList` 属性](http://caniuse.com/#feat=classlist)。因为 _class_ 模块在内部使用了 classList，所以在这种情况下将不起作用，除非您使用 classList 的 polyfill。（如果你不想使用 polyfill，你可以使用 _attributes_ 模块的 `class` 属性）

## Thunks

`thunk` 函数传入 一个选择器，一个 key 作为 thunk 的身份标识，一个返回 vnode 的函数，和一个 state 数组参数。如果调用，那么 render 函数将会接收 state 作为参数传入。

`thunk(selector, key, renderFn, [stateArguments])`

当 `renderFn` 改变 或 `[state]` 数组长度改变 亦或者 元素改变时 将调用 `renderFn`。

`key` 是可选的，但是当 `selector` 在同级 thunks 中不是唯一的时候则需要提供，这确保了在 diff 过程中 thunk 始终能正确匹配。

Thunks 是一种优化方法，用于数据的不可变性。

参考这个基于数字创建虚拟节点的函数。

```mjs
function numberView(n) {
  return h("div", "Number is: " + n);
}
```

这里的视图仅仅依赖于`n`，这意味着如果 `n` 未改变，随后又通过创建虚拟 DOM 节点来 patch 旧节点，这种操作是不必要的，我们可以使用 `thunk` 函数来避免上述操作。

```mjs
function render(state) {
  return thunk("num", numberView, [state.number]);
}
```

这与直接调用 `numberView` 函数不同的是，这只会在虚拟树中添加一个 伪节点，当 Snabbdom 对照旧节点 patch 这个伪节点时，它会比较 `n` 的值，如果 `n` 不变则复用旧的 vnode。这避免了在 diff 过程中重复创建数字视图。

这里的 view 函数仅仅是一个简单的示例，在实际使用中，thunks 在渲染一个需要耗费大量计算才能生成的复杂的视图时才能充分发挥它的价值。

## JSX

### TypeScript

在你的 `tsconfig.json` 文件中添加下列配置：

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "jsx"
  }
}
```

然后确保文件后缀名`.tsx` 并在文件头部引入 `jsx`：

```tsx
import { jsx, VNode } from "snabbdom";

const node: VNode = (
  <div>
    <span>I was created with JSX</span>
  </div>
);
```

### Babel

添加下列代码到你的 babel 配置中：

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

然后在文件头部引入 `jsx`：

```jsx
import { jsx } from "snabbdom";

const node = (
  <div>
    <span>I was created with JSX</span>
  </div>
);
```

## Virtual Node

**属性**

- [sel](#sel--string)
- [data](#data--object)
- [children](#children--array)
- [text](#text--string)
- [elm](#elm--element)
- [key](#key--string--number)

### sel : String

虚拟节点的 `.sel` 属性通过对 [`h()`](#h) 传入一个 CSS 选择器生成，比如： `h('div#container', {}, [...])` 将会创建一个虚拟节点并以 `div#container` 作为其 `.sel` 属性的值。

### data : Object

`.data` 属性是虚拟节点用于添加 [模块](#%E6%A8%A1%E5%9D%97%E6%96%87%E6%A1%A3) 信息以便在创建时访问或操作 DOM 元素、添加样式、操作 CSS classes、attributes 等

data 对象是 [`h()`](#h) 的第二个参数（可选）

比如： `h('div', {props: {className: 'container'}}, [...])` 将会生成一个虚拟节点，其属性 `.data` 的值为

```mjs
({
  props: {
    className: "container",
  },
});
```

### children : Array<vnode>

虚拟节点的 `.children` 属性通过 [`h()`](#h) 传入的第三个参数（可选）生成。`.children` 仅仅是一个虚拟节点数组，在创建时将其作为子节点添加到父级 DOM 节点中。

比如： `h('div', {}, [ h('h1', {}, 'Hello, World') ])` 将会创建一个虚拟节点，其 `.children` 的值为

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

### text : string

当仅使用文本作为子节点并通过 `document.createTextNode()` 创建虚拟节点时，生成 `.text`。

比如：`h('h1', {}, 'Hello')` 将会创建一个虚拟节点，其 `.text` 的值为 `Hello`

### elm : Element

`.elm` 属性指向由 snabbdom 创建的真实 DOM 节点，这个属性在 [hooks](#hooks) 和 [modules](#%E6%A8%A1%E5%9D%97%E6%96%87%E6%A1%A3) 中做计算都非常有用。

### key : string | number

当你在 [`.data`](#data--object) 对象中提供了 key 时将会创建 `.key` 属性，`.key` 属性用于给旧的、已存在的 DOM 节点提供一个标识，有效避免了不必要的重建操作。这对于像列表重排这类操作非常有用，此外 key 必须是 `string ` 或者 `number ` 以便用于查找，这是因为参数是以键值对的形式存储在内存中，这里 键为 `.key` 而 值则为 `.elm`。

这里 `.key` 在同级元素之间必须是唯一的。

比如： `h('div', {key: 1}, [])` 会创建一个虚拟节点并以值 `1` 作为 `.key` 的值。

## 构建应用程序

Snabbdom 只是一个低层虚拟 DOM 库，对于你如何构建应用程序来说没有限制。

下面列举一些使用 Snabbdom 构建应用程序的方法。

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

如果你通过其他方法来构建应用程序请确保将其共享。

## 常见错误

```text
Uncaught NotFoundError: Failed to execute 'insertBefore' on 'Node':
    The node before which the new node is to be inserted is not a child of this node.
```

出现这种错误的原因是在 patches 间复用 vnodes 导致（如下列代码所示），由于 snabbdom 会在虚拟 DOM 节点中存储真实 DOM 节点用于性能优化，所以并不支持在 patches 之间共享虚拟节点。

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

你可以通过浅拷贝来解决这个问题：

```mjs
const vnode2 = h("div", [
  h("div", {}, ["One"]),
  h("div", {}, [{ ...sharedNode }]),
  h("div", {}, ["Three"]),
]);
```

另一种解决方法是将需要共享的 vnodes 封装成函数：

```mjs
const sharedNode = () => h("div", {}, "Selected");
const vnode1 = h("div", [
  h("div", {}, ["One"]),
  h("div", {}, ["Two"]),
  h("div", {}, [sharedNode()]),
]);
```

## 社区反馈

对于一些社区所关心的 PR 将会在提交后数天内被合并。
