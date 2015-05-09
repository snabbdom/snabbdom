(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory); // AMD. Register as an anonymous module.
  } else if (typeof exports === 'object') {
    module.exports = factory(); // NodeJS
  } else { // Browser globals (root is window)
  root.snabbdom = factory();
  }
}(this, function () {

var isArr = Array.isArray;
function isString(s) { return typeof s === 'string'; }
function isUndef(s) { return s === undefined; }

function VNode(tag, props, children, text) {
  return {tag: tag, props: props, children: children, text: text, elm: undefined};
}

var emptyNodeAt = VNode.bind(null, {style: {}, class: {}}, []);
var frag = document.createDocumentFragment();
var emptyNode = VNode(undefined, {style: {}, class: {}}, [], undefined);

function h(selector, b, c) {
  var props = {}, children, tag, i;
  if (arguments.length === 3) {
    props = b; children = isString(c) ? [c] : c;
  } else if (arguments.length === 2) {
    if (isArr(b)) { children = b; }
    else if (isString(b)) { children = [b]; }
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
      if (isString(children[i])) children[i] = VNode(undefined, undefined, undefined, children[i]);
    }
  }

  return VNode(tag, props, children, undefined, undefined);
}

function setStyles(elm, styles) {
  for (var key in styles) {
    elm.style[key] = styles[key];
  }
}

function updateProps(elm, oldProps, props) {
  var key, val, name, on;
  for (key in props) {
    val = props[key];
    if (key === 'style') {
      for (name in val) {
        on = val[name];
        if (on !== oldProps.style[name]) {
          elm.style[name] = val[name];
        }
      }
    } else if (key === 'class') {
      for (name in val) {
        on = val[name];
        if (on !== oldProps.class[name]) {
          elm.classList[on ? 'add' : 'remove'](name);
        }
      }
    } else {
      elm[key] = val;
    }
  }
}

function createElm(vnode) {
  var elm;
  if (isUndef(vnode.text)) {
    elm = document.createElement(vnode.tag);
    updateProps(elm, emptyNode.props, vnode.props);
    var children = vnode.children;
    if (isArr(children)) {
      for (var i = 0; i < vnode.children.length; ++i) {
        elm.appendChild(createElm(children[i]));
      }
    }
  } else {
    elm = document.createTextNode(vnode.text);
  }
  vnode.elm = elm;
  return elm;
}

function sameElm(vnode1, vnode2) {
  var key1 = isUndef(vnode1.props) ? undefined : vnode1.props.key;
  var key2 = isUndef(vnode2.props) ? undefined : vnode2.props.key;
  return key1 === key2 && vnode1.tag === vnode2.tag;
}

function updateChildren(parentElm, oldCh, newCh) {
  if (isUndef(oldCh) && isUndef(newCh)) {
    return; // Neither new nor old element has any children
  }
  var oldStartPtr = 0, oldEndPtr = oldCh.length - 1;
  var newStartPtr = 0, newEndPtr = newCh.length - 1;
  var oldStartElm = oldCh[0], oldEndElm = oldCh[oldEndPtr];
  var newStartElm = newCh[0], newEndElm = newCh[newEndPtr];
  var success = true;

  var succes = true;
  while (success && oldStartPtr <= oldEndPtr && newStartPtr <= newEndPtr) {
    success = false;
    if (sameElm(oldStartElm, newStartElm)) {
      oldStartElm = oldCh[++oldStartPtr];
      newStartElm = newCh[++newStartPtr];
      success = true;
    }
    if (sameElm(oldEndElm, newEndElm)) {
      oldEndElm = oldCh[--oldEndPtr];
      newEndElm = newCh[--newEndPtr];
      success = true;
    }
    if (!isUndef(oldStartElm) && !isUndef(newEndElm) &&
        sameElm(oldStartElm, newEndElm)) { // Elm moved forward
      var beforeElm = oldEndElm.elm.nextSibling;
      parentElm.insertBefore(oldStartElm.elm, beforeElm);
      oldStartElm = oldCh[++oldStartPtr];
      newEndElm = newCh[--newEndPtr];
      success = true;
    }
  }
  if (oldStartPtr > oldEndPtr) { // Done with old elements
    for (; newStartPtr <= newEndPtr; ++newStartPtr) {
      frag.appendChild(createElm(newCh[newStartPtr]));
    }
    if (isUndef(oldStartElm)) {
      parentElm.appendChild(frag);
    } else {
      parentElm.insertBefore(frag, oldStartElm.elm);
    }
  } else if (newStartPtr > newEndPtr) { // Done with new elements
    for (; oldStartPtr <= oldEndPtr; ++oldStartPtr) {
      parentElm.removeChild(oldCh[oldStartPtr].elm);
      oldCh[oldStartPtr].elm = undefined;
    }
  }
}

function patchElm(oldVnode, newVnode) {
  var elm = oldVnode.elm;
  updateProps(elm, oldVnode.props, newVnode.props);
  updateChildren(elm, oldVnode.children, newVnode.children);
  return newVnode;
}

return {h: h, createElm: createElm, patchElm: patchElm};

}));
