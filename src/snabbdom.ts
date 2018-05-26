/* global Node */
import {VNodeType, Hooks, InsertHook, VNode, VNodes, Key, VText, VComment,
        Module, VElement, VFragment, DOMAPI, PreHook, CreateHook, UpdateHook, DestroyHook, RemoveHook, PostHook} from './types';

const { isArray } = Array;

function isUndef(s: any): s is undefined { return s === undefined; }
function isDef(s: any): boolean { return s !== undefined; }

type VNodeQueue = VNode[];

const emptyNode: VNode = {
  nt: 0,
  sel: '',
  data: {},
  children: undefined,
  text: undefined,
  elm: undefined,
  key: undefined,
};

type KeyToIndexMap = {[key: string]: number};

type ArraysOf<T> = {
  [K in keyof T]: (T[K])[];
}

export interface PatchFunction {
  (oldVnode: VNode, vnode: VNode): VNode;
  children(parentElm: Node, oldCh: VNodes, newCh: VNodes): VNodes;
}

function sameVnode(vnode1: VNode, vnode2: VNode): boolean {
  return vnode1.nt === vnode2.nt && vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}

function isVNode(vnode: any): vnode is VNode {
  return vnode != null;
}

function isElementVNode(vnode: VNode): vnode is VElement {
  return vnode.nt === VNodeType.Element;
}

function isFragmentVNode(vnode: VNode): vnode is VFragment {
  return vnode.nt === VNodeType.Fragment;
}

function isTextVNode(vnode: VNode): vnode is VText {
  return vnode.nt === VNodeType.Text;
}

function isCommentVNode(vnode: VNode): vnode is VComment {
  return vnode.nt === VNodeType.Comment;
}

function createKeyToOldIdx(children: VNodes, beginIdx: number, endIdx: number): KeyToIndexMap {
  const map: KeyToIndexMap = {};
  let i: number, key: Key | undefined, ch;
  for (i = beginIdx; i <= endIdx; ++i) {
    ch = children[i];
    if (isVNode(ch)) {
      key = ch.key;
      if (key !== undefined) map[key] = i;
    }
  }
  return map;
}

interface LifeCycleHooks {
  pre: PreHook;
  create: CreateHook;
  update: UpdateHook;
  destroy: DestroyHook;
  remove: RemoveHook;
  post: PostHook;
}

type ModuleHooks = ArraysOf<LifeCycleHooks>;

const hooks: (keyof LifeCycleHooks)[] = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];

export function init(modules: Array<Partial<Module>>, api: DOMAPI): PatchFunction {
  const cbs = ({} as ModuleHooks)
  let i: number, j: number;
  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      const hook = modules[j][hooks[i]];
      if (hook !== undefined) {
        (cbs[hooks[i]] as Array<any>).push(hook);
      }
    }
  }

  function createRmCb(childElm: Node, listeners: number) {
    return function rmCb() {
      if (--listeners === 0) {
        const parent = api.parentNode(childElm) as Node;
        api.removeChild(parent, childElm);
      }
    };
  }

  function createElm(vnode: VNode, insertedVnodeQueue: VNodeQueue): Node {
    let i: any;
    const {data} = vnode;
    if (!isUndef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) {
        i(vnode);
      }
    }
    if (isElementVNode(vnode)) {
      const {data, tag} = vnode;
      const elm = vnode.elm = isDef(i = data.ns) ? api.createElementNS(i, tag)
                                                 : api.createElement(tag);
      if (isDef(i = data.hook) && isDef(i.create)) i.create(emptyNode, vnode);
      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode);
      const { children } = vnode;
      if (isArray(children)) {
        for (i = 0; i < children.length; ++i) {
          const ch = children[i];
          if (isVNode(ch)) {
            api.appendChild(elm, createElm(ch, insertedVnodeQueue));
          }
        }
      } else if (!isUndef(vnode.text)) {
        api.appendChild(elm, api.createTextNode(vnode.text));
      }
      if (isDef(i = data.hook) && isDef(i.insert)) insertedVnodeQueue.push(vnode);
    } else if (isTextVNode(vnode)) {
      vnode.elm = api.createTextNode(vnode.text);
    } else if (isCommentVNode(vnode)) {
      vnode.elm = api.createComment(vnode.text);
    } else if (isFragmentVNode(vnode)) {
      vnode.elm = api.createFragment();
    } else {
      throw new TypeError();
    }
    return vnode.elm;
  }

  function addVnodes(parentElm: Node,
                     before: Node | null,
                     vnodes: VNodes,
                     startIdx: number,
                     endIdx: number,
                     insertedVnodeQueue: VNodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx];
      if (isVNode(ch)) {
        api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
      }
    }
  }

  function invokeDestroyHook(vnode: VNode) {
    const data = vnode.data;
    let i: any, j: number;
    if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode);
    for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode);
    const { children } = vnode;
    if (isUndef(children)) {
      return;
    }
    for (j = 0; j < children.length; ++j) {
      const n = children[j];
      if (isVNode(n) && !isTextVNode(n)) {
        invokeDestroyHook(n);
      }
    }
  }

  function removeVnodes(parentElm: Node,
                        vnodes: VNodes,
                        startIdx: number,
                        endIdx: number): void {
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx];
      let i: any, listeners: number, rm: () => void;
      // text nodes do not have logic associated to them
      if (isVNode(ch)) {
        if (!isTextVNode(ch)) {
          invokeDestroyHook(ch);
          listeners = cbs.remove.length + 1;
          rm = createRmCb(ch.elm as Node, listeners);
          for (i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm);
          if (isDef(i = ch.data.hook) && isDef(i = i.remove)) {
            i(ch, rm);
          } else {
            rm();
          }
        } else {
          api.removeChild(parentElm, ch.elm as Node);
        }
      }
    }
  }

  function updateChildren(parentElm: Node,
                          oldCh: VNodes,
                          newCh: VNodes,
                          insertedVnodeQueue: VNodeQueue) {
    let oldStartIdx = 0, newStartIdx = 0;
    let oldEndIdx = oldCh.length - 1;
    let oldStartVnode = oldCh[0];
    let oldEndVnode = oldCh[oldEndIdx];
    let newEndIdx = newCh.length - 1;
    let newStartVnode = newCh[0];
    let newEndVnode = newCh[newEndIdx];
    let oldKeyToIdx: any;
    let idxInOld: number;
    let elmToMove: VNode | null | undefined;
    let before: any;
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (!isVNode(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
      } else if (!isVNode(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (!isVNode(newStartVnode)) {
        newStartVnode = newCh[++newStartIdx];
      } else if (!isVNode(newEndVnode)) {
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldStartVnode.elm as Node, api.nextSibling(oldEndVnode.elm as Node));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldEndVnode.elm as Node, oldStartVnode.elm as Node);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (oldKeyToIdx === undefined) {
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        }
        idxInOld = oldKeyToIdx[newStartVnode.key as string];
        if (isUndef(idxInOld)) { // New element
          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm as Node);
          newStartVnode = newCh[++newStartIdx];
        } else {
          elmToMove = oldCh[idxInOld];
          if (isVNode(elmToMove)) {
            if (elmToMove.sel !== newStartVnode.sel) {
              api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm as Node);
            } else {
              patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
              oldCh[idxInOld] = undefined as any;
              api.insertBefore(parentElm, (elmToMove.elm as Node), oldStartVnode.elm as Node);
            }
          }
          newStartVnode = newCh[++newStartIdx];
        }
      }
    }
    if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
      if (oldStartIdx > oldEndIdx) {
        const n = newCh[newEndIdx+1];
        before = isVNode(n) ? n.elm : null;
        addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
      } else {
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
      }
    }
  }

  function patchVnode(oldVnode: VNode, vnode: VNode, insertedVnodeQueue: VNodeQueue) {
    let i: any, hook: any;
    if (isDef(i = vnode.data)) hook = i.hook;
    if (isDef(hook) && isDef(i = hook.prepatch)) {
      i(oldVnode, vnode);
    }
    const elm = vnode.elm = (oldVnode.elm as Node);
    if (oldVnode === vnode) return;
    if (vnode.data !== undefined) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode);
      if (isDef(hook) && isDef(i = hook.update)) i(oldVnode, vnode);
    }
    let oldCh = oldVnode.children;
    let ch = vnode.children;
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh as VNodes, ch as VNodes, insertedVnodeQueue);
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) api.setTextContent(elm, '');
        addVnodes(elm, null, ch as VNodes, 0, (ch as VNodes).length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh as VNodes, 0, (oldCh as VNodes).length - 1);
      } else if (isDef(oldVnode.text)) {
        api.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      api.setTextContent(elm, vnode.text);
    }
    if (isDef(hook) && isDef(i = hook.postpatch)) {
      i(oldVnode, vnode);
    }
  }

  const patch = function patch(oldVnode, vnode) {
    if (!isVNode(oldVnode) || !isVNode(vnode)) {
      throw new TypeError();
    }
    let i: number, n: number, elm: Node, parent: Node | null;
    const {pre, post} = cbs;
    const insertedVnodeQueue: VNodeQueue = [];
    for (i = 0, n = pre.length; i < n; ++i) pre[i]();

    if (sameVnode(oldVnode, vnode)) {
      patchVnode(oldVnode, vnode, insertedVnodeQueue);
    } else {
      elm = oldVnode.elm as Node;
      parent = api.parentNode(elm);

      createElm(vnode, insertedVnodeQueue);

      if (parent !== null) {
        api.insertBefore(parent, vnode.elm as Node, api.nextSibling(elm));
        removeVnodes(parent, [oldVnode], 0, 0);
      }
    }

    for (i = 0, n = insertedVnodeQueue.length; i < n; ++i) {
      // if a vnode is in this queue, it must have the insert hook defined
      ((insertedVnodeQueue[i].data.hook as Hooks).insert as InsertHook)(insertedVnodeQueue[i]);
    }
    for (i = 0, n = post.length; i < n; ++i) post[i]();
    return vnode;
  } as PatchFunction;

  patch.children = function children(parentElm, oldCh, newCh) {
    if (!isArray(oldCh) || !isArray(newCh)) {
      throw new TypeError();
    }
    let i: number, n: number;
    const {pre, post} = cbs;
    const insertedVnodeQueue: VNodeQueue = [];
    for (i = 0, n = pre.length; i < n; ++i) pre[i]();

    if (oldCh !== newCh) updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue);

    for (i = 0, n = insertedVnodeQueue.length; i < n; ++i) {
      // if a vnode is in this queue, it must have the insert hook defined
      ((insertedVnodeQueue[i].data.hook as Hooks).insert as InsertHook)(insertedVnodeQueue[i]);
    }
    for (i = 0, n = post.length; i < n; ++i) post[i]();
    return newCh;
  };

  return patch;
}
