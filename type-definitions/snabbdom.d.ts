export interface VNodeData {
  // modules - use any because Object type is useless
  props?: any;
  attrs?: any;
  class?: any;
  style?: any;
  dataset?: any;
  on?: any;
  hero?: any;
  // end of modules
  hook?: Hooks;
  key?: string | number;
  ns?: string; // for SVGs
  fn?: () => VNode; // for thunks
  args?: Array<any>; // for thunks
}

export interface VNode {
  sel: string;
  data?: VNodeData;
  children?: Array<VNode | string>;
  elm?: Element | Text;
  text?: string;
  key?: string | number;
}

export interface ThunkData extends VNodeData {
  fn: () => VNode;
  args: Array<any>;
}

export interface Thunk extends VNode {
  data: ThunkData;
}

export type PreHook = () => any;
export type InitHook = (vNode: VNode) => any;
export type CreateHook = (emptyVNode: VNode, vNode: VNode) => any;
export type InsertHook = (vNode: VNode) => any;
export type PrePatchHook = (oldVNode: VNode, vNode: VNode) => any;
export type UpdateHook = (oldVNode: VNode, vNode: VNode) => any;
export type PostPatchHook = (oldVNode: VNode, vNode: VNode) => any;
export type DestroyHook = (vNode: VNode) => any;
export type RemoveHook = (vNode: VNode, removeCallback: () => void) => any;
export type PostHook = () => any;

export interface Hooks {
  pre?: PreHook;
  init?: InitHook;
  create?: CreateHook;
  insert?: InsertHook;
  prepatch?: PrePatchHook;
  update?: UpdateHook;
  postpatch?: PostPatchHook;
  destroy?: DestroyHook;
  remove?: RemoveHook;
  post?: PostHook;
}

export interface Module {
  pre?: PreHook;
  create?: CreateHook;
  update?: UpdateHook;
  destroy?: DestroyHook;
  remove?: RemoveHook;
  post?: PostHook;
}

export interface SnabbdomAPI<T> {
  createElement(tagName: string): T;
  createElementNS(namespaceURI: string, qualifiedName: string): T;
  createTextNode(text: string): T;
  insertBefore(parentNode: T, newNode: T, referenceNode: T): void;
  removeChild(node: T, child: T): void;
  appendChild(node: T, child: T): void;
  parentNode(node: T): T;
  nextSibling(node: T): T;
  tagName(node: T): string;
  setTextContent(node: T, text: string): void;
}

declare module "snabbdom" {
  export interface PatchFunction {
    (oldVNode: VNode, vnode: VNode): VNode;
  }

  export function init(modules: Object, api?: SnabbdomAPI<any>): PatchFunction;
}

declare module "snabbdom/vnode" {
  export default function vnode(sel: string,
                                data: VNodeData,
                                children: Array<VNode | string>,
                                text: string,
                                elm: any): VNode;
}

declare module "snabbdom/is" {
  export function array(x: any): boolean;
  export function primitive(x: any): boolean;
}

declare module "snabbdom/thunk" {
  export default function thunk(sel: string,
                                key: string,
                                render: (...state: Array<any>) => VNode,
                                ...state: Array<any>): Thunk;
}

declare module "snabbdom/htmldomapi" {
  let api: SnabbdomAPI<Element>;
  export = api;
}

declare module "snabbdom/modules/class" {
  let ClassModule: Module;
  export = ClassModule;
}

declare module "snabbdom/modules/props" {
  let PropsModule: Module;
  export = PropsModule;
}

declare module "snabbdom/modules/attributes" {
  let AttrsModule: Module;
  export = AttrsModule;
}

declare module "snabbdom/modules/eventlisteners" {
  let EventsModule: Module;
  export = EventsModule;
}

declare module "snabbdom/modules/hero" {
  let HeroModule: Module;
  export = HeroModule;
}

declare module "snabbdom/modules/style" {
  let StyleModule: Module;
  export = StyleModule;
}

declare module "snabbdom/modules/dataset" {
  let DatasetModule: Module;
  export = DatasetModule;
}
