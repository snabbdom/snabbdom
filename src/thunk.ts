import { VNode, VNodeData } from "./vnode";
import { h, addNS } from "./h";

export interface ThunkData extends VNodeData {
  fn: () => VNode;
  args: any[];
}

export interface Thunk extends VNode {
  data: ThunkData;
}

export interface ThunkFn {
  (sel: string, fn: (...args: any[]) => any, args: any[]): Thunk;
  (sel: string, key: any, fn: (...args: any[]) => any, args: any[]): Thunk;
}

function copyToThunk(vnode: VNode, thunk: VNode): void {
  const ns = thunk.data?.ns;
  (vnode.data as VNodeData).fn = (thunk.data as VNodeData).fn;
  (vnode.data as VNodeData).args = (thunk.data as VNodeData).args;
  thunk.data = vnode.data;
  thunk.children = vnode.children;
  thunk.text = vnode.text;
  thunk.elm = vnode.elm;
  if (ns) addNS(thunk.data, thunk.children, thunk.sel);
}

function init(thunk: VNode): void {
  const cur = thunk.data as VNodeData;
  const vnode = (cur.fn as any)(...cur.args!);
  copyToThunk(vnode, thunk);
}

function prepatch(oldVnode: VNode, thunk: VNode): void {
  let i: number;
  const old = oldVnode.data as VNodeData;
  const cur = thunk.data as VNodeData;
  const oldArgs = old.args;
  const args = cur.args;
  if (old.fn !== cur.fn || (oldArgs as any).length !== (args as any).length) {
    copyToThunk((cur.fn as any)(...args!), thunk);
    return;
  }
  for (i = 0; i < (args as any).length; ++i) {
    if ((oldArgs as any)[i] !== (args as any)[i]) {
      copyToThunk((cur.fn as any)(...args!), thunk);
      return;
    }
  }
  copyToThunk(oldVnode, thunk);
}

export const thunk = function thunk(
  sel: string,
  key?: any,
  fn?: any,
  args?: any
): VNode {
  if (args === undefined) {
    args = fn;
    fn = key;
    key = undefined;
  }
  return h(sel, {
    key: key,
    hook: { init, prepatch },
    fn: fn,
    args: args,
  });
} as ThunkFn;
