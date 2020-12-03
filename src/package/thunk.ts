import { VNode, VNodeData } from "./vnode";
import { h } from "./h";

export interface ThunkData extends VNodeData {
  fn: () => VNode;
  args: any[];
}

export interface Thunk extends VNode {
  data: ThunkData;
}

type ThunkCompareFn<T = any> = (a: T, b: T) => boolean;

export interface ThunkFn<P extends any[] = any[]> {
  (
    sel: string,
    fn: (...p: P) => VNode,
    args: P,
    compareFn?: ThunkCompareFn
  ): Thunk;
  (
    sel: string,
    key: any,
    fn: (...p: P) => VNode,
    args: P,
    compareFn?: ThunkCompareFn
  ): Thunk;
}

function copyToThunk(vnode: VNode, thunk: VNode): void {
  (vnode.data as VNodeData).fn = (thunk.data as VNodeData).fn;
  (vnode.data as VNodeData).compareFn = (thunk.data as VNodeData).compareFn;
  (vnode.data as VNodeData).args = (thunk.data as VNodeData).args;
  thunk.data = vnode.data;
  thunk.children = vnode.children;
  thunk.text = vnode.text;
  thunk.elm = vnode.elm;
}

function init(thunk: VNode): void {
  const cur = thunk.data as VNodeData;
  const vnode = (cur.fn as any).apply(undefined, cur.args);
  copyToThunk(vnode, thunk);
}

function prepatch(oldVnode: VNode, thunk: VNode): void {
  let i: number;
  const old = oldVnode.data as VNodeData;
  const cur = thunk.data as VNodeData;
  const oldArgs = old.args as any[];
  const args = cur.args as any[];
  if (old.fn !== cur.fn || oldArgs.length !== args.length) {
    copyToThunk((cur.fn as any).apply(undefined, args), thunk);
    return;
  }
  const compareFn = cur.compareFn || ((a: any, b: any) => a === b);
  for (i = 0; i < args.length; ++i) {
    if (!compareFn(oldArgs[i], args[i])) {
      copyToThunk((cur.fn as any).apply(undefined, args), thunk);
      return;
    }
  }
  copyToThunk(oldVnode, thunk);
}

export const thunk = function thunk(
  sel: string,
  key?: any,
  fn?: any,
  args?: any,
  compareFn?: any
): VNode {
  if (typeof key === "function") {
    compareFn = args;
    args = fn;
    fn = key;
    key = undefined;
  }
  return h(sel, {
    key: key,
    hook: { init, prepatch },
    fn: fn,
    compareFn: compareFn,
    args: args,
  });
} as ThunkFn;
