import {VNode, VNodeData} from './vnode';
import {h} from './h';

export interface ThunkEqualityFn {
  (arg1: any, arg2: any): boolean;
}

export interface ThunkData extends VNodeData {
  fn: () => VNode;
  args: Array<any>;
  equalityFn?: ThunkEqualityFn
}

export interface Thunk extends VNode {
  data: ThunkData;
}

const defaultEqFn: ThunkEqualityFn = (arg1: any, arg2: any) => arg1 === arg2;

export interface ThunkFn {
  (sel: string, fn: Function, args: Array<any>): Thunk;
  (sel: string, key: any, fn: Function, args: Array<any>): Thunk;
  (sel: string, options: ThunkData): Thunk;
}

function copyToThunk(vnode: VNode, thunk: VNode): void {
  thunk.elm = vnode.elm;
  (vnode.data as VNodeData).fn = (thunk.data as VNodeData).fn;
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
  let i: number, old = oldVnode.data as ThunkData, cur = thunk.data as ThunkData;
  let equalityFn = cur.equalityFn || defaultEqFn;
  const oldArgs = old.args, args = cur.args;
  if (old.fn !== cur.fn || (oldArgs as any).length !== (args as any).length) {
    copyToThunk((cur.fn as any).apply(undefined, args), thunk);
  }
  for (i = 0; i < (args as any).length; ++i) {
    let notEquals = !equalityFn((oldArgs as any)[i], (args as any)[i]);
    if (notEquals) {
      copyToThunk((cur.fn as any).apply(undefined, args), thunk);
      return;
    }
  }
  copyToThunk(oldVnode, thunk);
}

export const thunk = function thunk(sel: string, key?: any, fn?: any, args?: any): VNode {
  if (typeof key === 'object' && key.hasOwnProperty('fn')) {
    let thunkData = key as ThunkData;
    thunkData.hook = thunkData.hook ? thunkData.hook : {}

    thunkData.hook.init = init;
    thunkData.hook.prepatch = prepatch;
    return h(sel, thunkData);
  }

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
  });
} as ThunkFn;

export default thunk;
