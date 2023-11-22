// core
export { htmlDomApi } from "./htmldomapi";
export { init } from "./init";
export { thunk } from "./thunk";
export { vnode } from "./vnode";

export type { DOMAPI } from "./htmldomapi";
export type { Options } from "./init";
export type { ThunkData, Thunk, ThunkFn } from "./thunk";
export type { Key, VNode, VNodeData } from "./vnode";

// helpers
export { attachTo } from "./helpers/attachto";
export { array, primitive } from "./is";
export { toVNode } from "./tovnode";
export { h, fragment } from "./h";

export type { AttachData } from "./helpers/attachto";
export type {
  VNodes,
  VNodeChildElement,
  ArrayOrElement,
  VNodeChildren
} from "./h";

// types
export * from "./hooks";
export type { Module } from "./modules/module";

// modules
export { attributesModule } from "./modules/attributes";
export { classModule } from "./modules/class";
export { datasetModule } from "./modules/dataset";
export { eventListenersModule } from "./modules/eventlisteners";
export { propsModule } from "./modules/props";
export { styleModule } from "./modules/style";
export type { Attrs } from "./modules/attributes";
export type { Classes } from "./modules/class";
export type { Dataset } from "./modules/dataset";
export type { On } from "./modules/eventlisteners";
export type { Props } from "./modules/props";
export type { VNodeStyle } from "./modules/style";

// JSX
export { jsx, Fragment } from "./jsx";
export type { JsxVNodeChild, JsxVNodeChildren, FunctionComponent } from "./jsx";
