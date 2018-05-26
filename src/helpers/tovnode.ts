import {VNode, VNodes} from '../types';
import {vnodeElement, vnodeText, vnodeComment, vnodeFragment} from './h';
import {Attrs} from '../modules/attributes';

function extractChildren(vnode: VNode) {
  let i: number, n: number;
  const node = vnode.elm as Node;
  const elmChildren = node.childNodes;
  const children = vnode.children as VNodes;
  for (i = 0, n = elmChildren.length; i < n; i++) {
    children.push(toVNode(elmChildren[i]));
  }
}

function extractIdentity(vnode: VNode) {
  const { sel, data: { attrs } } = vnode;
  const id = (attrs as Attrs).id ? '#' + (attrs as Attrs).id : '';
  const cn = (attrs as Attrs).class as string;
  const c = cn != null ? '.' + cn.split(' ').join('.') : '';
  if (id.length > 0 || c.length > 0) {
    vnode.sel = sel + id + c;
  }
}

function extractAttributes(vnode: VNode) {
  let i: number, n: number;
  const node = vnode.elm as Node;
  const attrs: Attrs = {};
  let name: string, value: string | null;
  const elmAttrs = node.attributes;
  for (i = 0, n = elmAttrs.length; i < n; i++) {
    name = elmAttrs[i].nodeName;
    value = elmAttrs[i].nodeValue;
    if (value !== null) {
      attrs[name] = value;
    }
  }
  vnode.data.attrs = attrs;
}

function tagName(elm: Element): string {
  return elm.tagName;
}

function getTextContent(node: Node): string | null {
  return node.textContent;
}

function isElement(node: Node): node is Element {
  return node.nodeType === 1;
}

function isFragment(node: Node): node is DocumentFragment {
  return node.nodeType === 11;
}

function isText(node: Node): node is Text {
  return node.nodeType === 3;
}

function isComment(node: Node): node is Comment {
  return node.nodeType === 8;
}

function toVNode(node: Node): VNode {
  let text: string;
  let vnode: VNode;
  if (isElement(node)) {
    vnode = vnodeElement(tagName(node).toLowerCase(), {}, []);
    vnode.elm = node;
    extractChildren(vnode);
    extractAttributes(vnode);
    extractIdentity(vnode);
  } else if (isText(node)) {
    text = getTextContent(node) as string;
    vnode = vnodeText(text == null ? '' : text);
    vnode.elm = node;
  } else if (isComment(node)) {
    text = getTextContent(node) as string;
    vnode = vnodeComment(text);
    vnode.elm = node;
  } else if (isFragment(node)) {
    vnode = vnodeFragment({}, []);
    vnode.elm = node;
    extractChildren(vnode);
  } else {
    throw new TypeError();
  }
  return vnode;
}

export default toVNode;