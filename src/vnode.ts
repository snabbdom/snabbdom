import { Hooks } from "./hooks";
import { AttachData } from "./helpers/attachto";
import { VNodeStyle } from "./modules/style";
import { On } from "./modules/eventlisteners";
import { Attrs } from "./modules/attributes";
import { Classes } from "./modules/class";
import { Props } from "./modules/props";
import { Dataset } from "./modules/dataset";

export type Key = string | number | symbol;

export interface VNode {
  sel: string | undefined;
  data: VNodeData | undefined;
  children: Array<VNode | string> | undefined;
  elm: Node | undefined;
  text: string | undefined;
  key: Key | undefined;
}

export interface VNodeData {
  props?: Props;
  attrs?: Attrs;
  class?: Classes;
  style?: VNodeStyle;
  dataset?: Dataset;
  on?: On;
  attachData?: AttachData;
  hook?: Hooks;
  key?: Key;
  ns?: string; // for SVGs
  fn?: () => VNode; // for thunks
  args?: any[]; // for thunks
  is?: string; // for custom elements v1
  [key: string]: any; // for any other 3rd party module
}

export function vnode(
  sel: string | undefined,
  data: any | undefined,
  children: Array<VNode | string> | undefined,
  text: string | undefined,
  elm: Element | DocumentFragment | Text | undefined
): VNode {
  const key = data === undefined ? undefined : data.key;
  return { sel, data, children, text, elm, key };
}
