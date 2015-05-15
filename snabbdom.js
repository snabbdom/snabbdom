// jshint newcap: false
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory); // AMD. Register as an anonymous module.
  } else if (typeof exports === 'object') {
    module.exports = factory(); // NodeJS
  } else { // Browser globals (root is window)
  root.snabbdom = factory();
  }
}(this, function () {

'use strict';

var isArr = Array.isArray;
function isString(s) { return typeof s === 'string'; }
function isPrimitive(s) { return typeof s === 'string' || typeof s === 'number'; }
function isUndef(s) { return s === undefined; }

function VNode(tag, props, children, text, elm) {
  var key = isUndef(props) ? undefined : props.key;
  return {tag: tag, props: props, children: children,
          text: text, elm: elm, key: key};
}

function emptyNodeAt(elm) {
  return VNode(elm.tagName, {style: {}, class: {}}, [], undefined, elm);
}
var emptyNode = VNode(undefined, {style: {}, class: {}}, [], undefined);

var frag = document.createDocumentFragment();

function h(selector, b, c) {
  var props = {}, children, tag, text, i;
  if (arguments.length === 3) {
    props = b;
    if (isArr(c)) { children = c; }
    else if (isPrimitive(c)) { text = c; }
  } else if (arguments.length === 2) {
    if (isArr(b)) { children = b; }
    else if (isPrimitive(b)) { text = b; }
    else { props = b; }
  }
  // Parse selector
  var hashIdx = selector.indexOf('#');
  var dotIdx = selector.indexOf('.', hashIdx);
  var hash = hashIdx > 0 ? hashIdx : selector.length;
  var dot = dotIdx > 0 ? dotIdx : selector.length;
  tag = selector.slice(0, Math.min(hash, dot));
  if (hash < dot) props.id = selector.slice(hash + 1, dot);
  if (dotIdx > 0) props.className = selector.slice(dot+1).replace(/\./g, ' ');

  if (isArr(children)) {
    for (i = 0; i < children.length; ++i) {
      if (isPrimitive(children[i])) children[i] = VNode(undefined, undefined, undefined, children[i]);
    }
  }
  return VNode(tag, props, children, text, undefined);
}

function arrInvoker(arr) {
  return function() { arr[0](arr[1]); };
}

function updateProps(elm, oldVnode, vnode) {
  var key, val, name, cur, old, oldProps = oldVnode.props, props = vnode.props;
  for (key in props) {
    val = props[key];
    if (key === 'style' || key === 'class') {
      for (name in val) {
        cur = val[name];
        if (cur !== oldProps[key][name]) {
          if (key === 'style') {
            elm.style[name] = cur;
          } else {
            elm.classList[cur ? 'add' : 'remove'](name);
          }
        }
      }
    } else if (key[0] === 'o' && key[1] === 'n') {
      name = key.slice(2);
      if (name !== 'insert' && name !== 'remove') {
        old = oldProps[key];
        if (isUndef(old)) {
          elm.addEventListener(name, isArr(val) ? arrInvoker(val) : val);
        } else if (isArr(old)) {
          old[0] = val[0]; // Deliberately modify old array since it's
          old[1] = val[1]; // captured in closure created with `arrInvoker`
        }
      }
    } else if (key !== 'key') {
      elm[key] = val;
    }
  }
}

function createElm(vnode) {
  var elm, children;
  if (!isUndef(vnode.tag)) {
    elm = vnode.elm = document.createElement(vnode.tag);
    updateProps(elm, emptyNode, vnode);
    children = vnode.children;
    if (isArr(children)) {
      for (var i = 0; i < children.length; ++i) {
        elm.appendChild(createElm(children[i]));
      }
    } else if (isPrimitive(vnode.text)) {
      elm.textContent = vnode.text;
    }
    if (vnode.props.oninsert) vnode.props.oninsert(vnode);
  } else {
    elm = vnode.elm = document.createTextNode(vnode.text);
  }
  return elm;
}

function sameVnode(vnode1, vnode2) {
  return vnode1.key === vnode2.key && vnode1.tag === vnode2.tag;
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
  var i, map = {}, key;
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (!isUndef(key)) {
      map[key] = i;
    }
  }
  return map;
}

function updateChildren(parentElm, oldCh, newCh) {
  var oldStartIdx = 0, oldEndIdx, oldStartVnode, oldEndVnode;
  if (isUndef(oldCh)) {
    oldEndIdx = -1;
  } else {
    oldEndIdx = oldCh.length - 1;
    oldStartVnode = oldCh[0];
    oldEndVnode = oldCh[oldEndIdx];
  }

  var newStartIdx = 0, newEndIdx, newStartVnode, newEndVnode;
  if (isUndef(newCh)) {
    newEndIdx = -1;
  } else {
    newEndIdx = newCh.length - 1;
    newStartVnode = newCh[0];
    newEndVnode = newCh[newEndIdx];
  }

  var oldKeyToIdx, idxInOld, elmToMove;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
      patchVnode(oldStartVnode, newEndVnode);
      parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling);
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
      patchVnode(oldEndVnode, newStartVnode);
      parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      idxInOld = oldKeyToIdx[newStartVnode.key];
      if (isUndef(idxInOld)) { // New element
        createElm(newStartVnode);
        parentElm.insertBefore(newStartVnode.elm, oldStartVnode.elm);
        newStartVnode = newCh[++newStartIdx];
      } else {
        elmToMove = oldCh[idxInOld];
        patchVnode(elmToMove, newStartVnode);
        oldCh[idxInOld] = undefined;
        parentElm.insertBefore(elmToMove.elm, oldStartVnode.elm);
        newStartVnode = newCh[++newStartIdx];
      }
    }
  }
  if (oldStartIdx > oldEndIdx) { // Done with old elements
    for (; newStartIdx <= newEndIdx; ++newStartIdx) {
      frag.appendChild(createElm(newCh[newStartIdx]));
    }
    if (isUndef(oldStartVnode)) {
      parentElm.appendChild(frag);
    } else {
      parentElm.insertBefore(frag, oldStartVnode.elm);
    }
  } else if (newStartIdx > newEndIdx) { // Done with new elements
    for (; oldStartIdx <= oldEndIdx; ++oldStartIdx) {
      var ch = oldCh[oldStartIdx];
      if (!isUndef(ch)) {
        if (ch.props.onremove) {
          ch.props.onremove(ch, parentElm.removeChild.bind(parentElm, ch.elm));
        } else {
          parentElm.removeChild(ch.elm);
        }
        ch.elm = undefined;
      }
    }
  }
}

function patchVnode(oldVnode, newVnode) {
  var elm = newVnode.elm = oldVnode.elm;
  if (!isUndef(newVnode.props)) updateProps(elm, oldVnode, newVnode);
  if (isUndef(newVnode.text)) {
    updateChildren(elm, oldVnode.children, newVnode.children);
  } else if (oldVnode.text !== newVnode.text) {
    elm.textContent = newVnode.text;
  }
  return newVnode;
}

return {h: h, createElm: createElm, patch: patchVnode, emptyNodeAt: emptyNodeAt, emptyNode: emptyNode};

}));
