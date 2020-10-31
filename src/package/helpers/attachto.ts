import { VNode, VNodeData } from "../vnode";

export interface AttachData {
  [key: string]: any;
  [i: number]: any;
  placeholder?: any;
  real?: Node;
}

interface VNodeDataWithAttach extends VNodeData {
  attachData: AttachData;
}

interface VNodeWithAttachData extends VNode {
  data: VNodeDataWithAttach;
}

function pre(vnode: VNodeWithAttachData, newVnode: VNodeWithAttachData): void {
  const attachData = vnode.data.attachData;
  // Copy created placeholder and real element from old vnode
  newVnode.data.attachData.placeholder = attachData.placeholder;
  newVnode.data.attachData.real = attachData.real;
  // Mount real element in vnode so the patch process operates on it
  vnode.elm = vnode.data.attachData.real;
}

function post(_: any, vnode: VNodeWithAttachData): void {
  // Mount dummy placeholder in vnode so potential reorders use it
  vnode.elm = vnode.data.attachData.placeholder;
}

function destroy(vnode: VNodeWithAttachData): void {
  // Remove placeholder
  if (vnode.elm !== undefined) {
    (vnode.elm.parentNode as HTMLElement).removeChild(vnode.elm);
  }
  // Remove real element from where it was inserted
  vnode.elm = vnode.data.attachData.real;
}

function create(_: any, vnode: VNodeWithAttachData): void {
  const real = vnode.elm;
  const attachData = vnode.data.attachData;
  const placeholder = document.createElement("span");
  // Replace actual element with dummy placeholder
  // Snabbdom will then insert placeholder instead
  vnode.elm = placeholder;
  attachData.target.appendChild(real);
  attachData.real = real;
  attachData.placeholder = placeholder;
}

export function attachTo(target: Element, vnode: VNode): VNode {
  if (vnode.data === undefined) vnode.data = {};
  if (vnode.data.hook === undefined) vnode.data.hook = {};
  const data = vnode.data;
  const hook = vnode.data.hook;
  data.attachData = { target: target, placeholder: undefined, real: undefined };
  hook.create = create;
  hook.prepatch = pre;
  hook.postpatch = post;
  hook.destroy = destroy;
  return vnode;
}
