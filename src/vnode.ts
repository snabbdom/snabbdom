import { Hooks } from './hooks.js';
import { AttachData } from './helpers/attachto.js';
import { VNodeStyle } from './modules/style.js';
import { On } from './modules/eventlisteners.js';
import { Attrs } from './modules/attributes.js';
import { Classes } from './modules/class.js';
import { Props } from './modules/props.js';
import { Dataset } from './modules/dataset.js';
import { Hero } from './modules/hero.js';

export type Key = string | number;

export interface VNode {
  sel: string | undefined
  data: VNodeData | undefined
  children: Array<VNode | string> | undefined
  elm: Node | undefined
  text: string | undefined
  key: Key | undefined
}

export interface VNodeData {
  props?: Props
  attrs?: Attrs
  class?: Classes
  style?: VNodeStyle
  dataset?: Dataset
  on?: On
  hero?: Hero
  attachData?: AttachData
  hook?: Hooks
  key?: Key
  ns?: string // for SVGs
  fn?: () => VNode // for thunks
  args?: any[] // for thunks
  [key: string]: any // for any other 3rd party module
}

export function vnode (sel: string | undefined,
  data: any | undefined,
  children: Array<VNode | string> | undefined,
  text: string | undefined,
  elm: Element | Text | undefined): VNode {
  const key = data === undefined ? undefined : data.key;
  return { sel, data, children, text, elm, key };
}

export default vnode;
