import {VNodeType, VNode, VNodes, VNodeData, VElement, VText, VComment, VFragment} from '../types';
export type VNodeChildElement = VNode | string | number | undefined | null;
export type ArrayOrElement<T> = T | T[];
export type VNodeChildren = ArrayOrElement<VNodeChildElement>

function isVElement(vnode: VNode): vnode is VElement {
  return vnode.nt === VNodeType.Element;
}

function addNS(vnode: VElement) {
  const { data, children, sel } = vnode;
  // TODO: review why `sel` equal `foreignObject` should get this `ns`
  data.ns = 'http://www.w3.org/2000/svg';
  if (isArray(children) && sel !== 'foreignObject') {
    for (let i = 0, n = children.length; i < n; ++i) {
      const childNode = children[i];
      if (childNode != null && isVElement(childNode)) {
        addNS(childNode);
      }
    }
  }
}

const { isArray } = Array;
const { charCodeAt } = String.prototype;

const sChar = 115, vChar = 118, gChar = 103, exclamationChar = 33;

function primitive(s: any): s is (string | number) {
  return typeof s === 'string' || typeof s === 'number';
}

export function vnodeElement(tag: string, data: VNodeData,
                            children: VNodes, text?: string): VElement {
  const { key } = data;
  let sel = tag, elm;
  return {
    nt: VNodeType.Element,
    tag,
    sel,
    data,
    children,
    text,
    elm,
    key
  };
}

export function vnodeFragment(data: VNodeData, children: VNodes, text?: string): VFragment {
  let sel, key, elm;
  return {
    nt: VNodeType.Fragment,
    sel,
    data,
    children,
    text,
    elm,
    key,
  };
}

export function vnodeText(text: string): VText {
  let sel, data = {}, children, key, elm;
  return {
    nt: VNodeType.Text,
    sel,
    data,
    children,
    text,
    elm,
    key,
  };
}

export function vnodeComment(text: string): VComment {
  let sel = '!', data = {}, children, key, elm;
  return {
    nt: VNodeType.Comment,
    sel,
    data,
    children,
    text,
    elm,
    key,
  };
}

function h(sel: string): VNode;
function h(sel: string, data: VNodeData): VNode;
function h(sel: string, children: VNodeChildren): VNode;
function h(sel: string, data: VNodeData, children: VNodeChildren): VNode;
function h(sel: any, b?: any, c?: any): VNode {
  var data: VNodeData = {}, children: any, text: any, i: number;
  if (c !== undefined) {
    data = b;
    if (isArray(c)) { children = c; }
    else if (primitive(c)) { text = c; }
    else if (c && c.sel) { children = [c]; }
  } else if (b !== undefined) {
    if (isArray(b)) { children = b; }
    else if (primitive(b)) { text = b; }
    else if (b && b.sel) { children = [b]; }
    else { data = b; }
  }
  const firstCharCode = charCodeAt.call(sel, 0);
  if (firstCharCode === exclamationChar) {
    return vnodeComment(text == null ? '' : text as string);
  } else if (sel === undefined) {
    return vnodeText(text == null ? '' : text as string);
  }
  // normalize children
  if (isArray(children)) {
    for (i = 0; i < children.length; ++i) {
      const ch = children[i];
      if (ch == null) children[i] = null;
      else if (primitive(ch)) children[i] = vnodeText(ch as string);
    }
  } else if (children != null) {
    children = [children];
  }
  // normalize data
  data = data || {};
  if (sel === '') {
    return vnodeFragment(data, children, text);
  }
  // parse selector
  const hashIdx = sel.indexOf('#');
  const dotIdx = sel.indexOf('.', hashIdx);
  const len = sel.length;
  const hash = hashIdx > 0 ? hashIdx : len;
  const dot = dotIdx > 0 ? dotIdx : len;
  if (hashIdx > 0) {
    const attrs = data.attrs = data.attrs || {};
    attrs.id = sel.slice(hash + 1, dot);
  }
  if (dotIdx > 0) {
    const attrs = data.attrs = data.attrs || {};
    attrs.class = sel.slice(dot + 1).replace(/\./g, ' ');
  }
  const tag = sel.slice(0, Math.min(hash, dot));
  const vnode = vnodeElement(tag, data, children, text);
  if (hashIdx !== dotIdx) {
    vnode.sel = sel;
  }
  // normalizing SVG namespacing
  if (charCodeAt.call(tag, 0) === sChar && charCodeAt.call(tag, 1) === vChar && charCodeAt.call(tag, 2) === gChar && tag.length === 3) {
    addNS(vnode);
  }
  return vnode;
};
export default h;
