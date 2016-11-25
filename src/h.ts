import {vnode, VNode} from './vnode';
import * as is from './is';

function addNS(data: any, children: Array<VNode> | undefined, sel: string | undefined): void {
  data.ns = 'http://www.w3.org/2000/svg';
  if (sel !== 'foreignObject' && children !== undefined) {
    for (let i = 0; i < children.length; ++i) {
      addNS(children[i].data, (children[i] as VNode).children as Array<VNode>, children[i].sel);
    }
  }
}

export function h(sel: string): VNode;
export function h(sel: string, data: any): VNode;
export function h(sel: string, text: string): VNode;
export function h(sel: string, children: Array<VNode>): VNode;
export function h(sel: string, data: any, text: string): VNode;
export function h(sel: string, data: any, children: Array<VNode>): VNode;
export function h(sel: any, b?: any, c?: any): VNode {
  var data = {}, children: any, text: any, i: number;
  if (c !== undefined) {
    data = b;
    if (is.array(c)) { children = c; }
    else if (is.primitive(c)) { text = c; }
    else if (c && c.sel) { children = [c]; }
  } else if (b !== undefined) {
    if (is.array(b)) { children = b; }
    else if (is.primitive(b)) { text = b; }
    else if (b && b.sel) { children = [b]; }
    else { data = b; }
  }
  if (is.array(children)) {
    for (i = 0; i < children.length; ++i) {
      if (is.primitive(children[i])) children[i] = (vnode as any)(undefined, undefined, undefined, children[i]);
    }
  }
  if (sel[0] === 's' && sel[1] === 'v' && sel[2] === 'g') {
    addNS(data, children, sel);
  }
  return vnode(sel, data, children, text, undefined);
};
export default h;
