import {VNode, VNodeData} from '../types';
import h from './h';

export interface ThunkData extends VNodeData {
  fn: () => VNode;
  args: Array<any>;
}

export interface Thunk extends VNode {
  data: ThunkData;
}

export interface ThunkFn {
  (sel: string, fn: Function, args: Array<any>): Thunk;
  (sel: string, key: any, fn: Function, args: Array<any>): Thunk;
}

function copyToThunk(vnode: VNode, thunk: VNode): void {
  thunk.elm = vnode.elm;
  vnode.data.fn = thunk.data.fn;
  vnode.data.args = thunk.data.args;
  thunk.data = vnode.data;
  thunk.children = vnode.children;
  thunk.text = vnode.text;
  thunk.elm = vnode.elm;
}

function init(thunk: Thunk) {
  const cur = thunk.data;
  const vnode = cur.fn.apply(undefined, cur.args);
  copyToThunk(vnode, thunk);
}

function prepatch(oldVnode: VNode, thunk: Thunk) {
  let i: number, old = oldVnode.data, cur = thunk.data;
  const oldArgs = old.args, args = cur.args;
  if (old.fn !== cur.fn || (oldArgs as any).length !== args.length) {
    copyToThunk((cur.fn).apply(undefined, args), thunk);
    return;
  }
  for (i = 0; i < args.length; ++i) {
    if ((oldArgs as any)[i] !== args[i]) {
      copyToThunk((cur.fn as any).apply(undefined, args), thunk);
      return;
    }
  }
  copyToThunk(oldVnode, thunk);
}

const thunk = function thunk(sel: string, key?: any, fn?: any, args?: any): Thunk {
  if (args === undefined) {
    args = fn;
    fn = key;
    key = undefined;
  }
  return h(sel, {
    key: key,
    hook: {init: init, prepatch: prepatch},
    fn: fn,
    args: args
  }) as Thunk;
} as ThunkFn;

export default thunk;