// core
export { htmlDomApi } from "./htmldomapi.js";
export { init } from "./init.js";
export { thunk } from "./thunk.js";
export { vnode } from "./vnode.js";

export type { DOMAPI } from "./htmldomapi.js";
export type { Options } from "./init.js";
export type { ThunkData, Thunk, ThunkFn } from "./thunk.js";
export type { Key, VNode, VNodeData } from "./vnode.js";

// helpers
export { attachTo } from "./helpers/attachto.js";
export { array, primitive } from "./is.js";
export { toVNode } from "./tovnode.js";
export { h, fragment } from "./h.js";

export type { AttachData } from "./helpers/attachto.js";
export type {
  VNodes,
  VNodeChildElement,
  ArrayOrElement,
  VNodeChildren
} from "./h.js";

// types
export * from "./hooks.js";
export type { Module } from "./modules/module.js";

// modules
export { attributesModule } from "./modules/attributes.js";
export { classModule } from "./modules/class.js";
export { datasetModule } from "./modules/dataset.js";
export { eventListenersModule } from "./modules/eventlisteners.js";
export { propsModule } from "./modules/props.js";
export { styleModule } from "./modules/style.js";
export type { Attrs } from "./modules/attributes.js";
export type { Classes } from "./modules/class.js";
export type { Dataset } from "./modules/dataset.js";
export type { On } from "./modules/eventlisteners.js";
export type { Props } from "./modules/props.js";
export type { VNodeStyle } from "./modules/style.js";

// JSX
export { jsx, Fragment } from "./jsx.js";
export type {
  JsxVNodeChild,
  JsxVNodeChildren,
  FunctionComponent
} from "./jsx.js";
