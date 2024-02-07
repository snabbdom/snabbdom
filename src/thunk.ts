import { Key, VNode, VNodeData } from "./vnode";
import { h, addNS } from "./h";

interface ThunkData<T extends readonly unknown[]> extends VNodeData {
  _args: [...T];
  _fn: (...args: T) => VNode;
  _comparator: (prev: T, cur: T) => boolean | undefined;
}

function copyToThunk(vnode: VNode, thunk: VNode): void {
  const ns = thunk.data?.ns;
  vnode.data!._args = thunk.data!._args;
  thunk.data = vnode.data;
  thunk.children = vnode.children;
  thunk.text = vnode.text;
  thunk.elm = vnode.elm;
  if (ns !== undefined) {
    addNS(thunk.data, thunk.children, thunk.sel);
  }
}

function init<T extends readonly unknown[]>(thunk: VNode): void {
  const cur = thunk.data as ThunkData<T>;
  const vnode = cur._fn(...cur._args);
  copyToThunk(vnode, thunk);
}

function prepatch<T extends readonly unknown[]>(
  oldVnode: VNode,
  thunk: VNode
): void {
  const cur = thunk.data! as ThunkData<T>;
  const args = cur._args;
  const oldArgs = oldVnode.data!._args as T;
  if (oldArgs.length !== args.length) {
    copyToThunk(cur._fn(...args), thunk);
    return;
  }
  const comparator = cur._comparator;
  if (comparator === undefined) {
    for (let i = 0; i < args.length; ++i) {
      if (oldArgs[i] !== args[i]) {
        copyToThunk(cur._fn(...args), thunk);
        return;
      }
    }
    copyToThunk(oldVnode, thunk);
  } else {
    const vnode = comparator(oldArgs, args) ? oldVnode : cur._fn(...args);
    copyToThunk(vnode, thunk);
  }
}

const thunkHooks = { init, prepatch };

export function thunk<T extends readonly unknown[]>(
  sel: string,
  opts: { key?: Key; comparator?: (prev: T, cur: T) => boolean },
  fn: (...args: T) => VNode,
  args: [...T]
): VNode {
  return h(sel, {
    key: opts.key,
    hook: thunkHooks,
    _fn: fn,
    _args: args,
    _comparator: opts.comparator
  });
}
