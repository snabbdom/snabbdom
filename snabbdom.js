// jshint newcap: false
'use strict';

var VNode = require('./vnode');
var is = require('./is');

function isUndef(s) { return s === undefined; }

function emptyNodeAt(elm) {
  return VNode(elm.tagName, {}, [], undefined, elm);
}

var emptyNode = VNode('', {}, [], undefined, undefined);

var frag = document.createDocumentFragment();

var insertedVnodeQueue;

function sameVnode(vnode1, vnode2) {
  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
  var i, map = {}, key;
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (!isUndef(key)) map[key] = i;
  }
  return map;
}

function createRmCb(parentElm, childElm, listeners) {
  return function() {
    if (--listeners === 0) parentElm.removeChild(childElm);
  };
}

function init(modules) {
  var createCbs = [];
  var updateCbs = [];
  var removeCbs = [];
  var destroyCbs = [];
  var preCbs = [];
  var postCbs = [];

  modules.forEach(function(module) {
    if (module.create) createCbs.push(module.create);
    if (module.update) updateCbs.push(module.update);
    if (module.remove) removeCbs.push(module.remove);
    if (module.destroy) destroyCbs.push(module.destroy);
    if (module.pre) preCbs.push(module.pre);
    if (module.post) postCbs.push(module.post);
  });

  function createElm(vnode) {
    var i, elm, children = vnode.children, sel = vnode.sel;
    if (!isUndef(sel)) {
      // Parse selector
      var hashIdx = sel.indexOf('#');
      var dotIdx = sel.indexOf('.', hashIdx);
      var hash = hashIdx > 0 ? hashIdx : sel.length;
      var dot = dotIdx > 0 ? dotIdx : sel.length;
      var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
      elm = vnode.elm = document.createElement(tag);
      if (hash < dot) elm.id = sel.slice(hash + 1, dot);
      if (dotIdx > 0) elm.className = sel.slice(dot+1).replace(/\./g, ' ');
      if (is.array(children)) {
        for (i = 0; i < children.length; ++i) {
          elm.appendChild(createElm(children[i]));
        }
      } else if (is.primitive(vnode.text)) {
        elm.appendChild(document.createTextNode(vnode.text));
      }
      for (i = 0; i < createCbs.length; ++i) createCbs[i](emptyNode, vnode);
      i = vnode.data.hook; // Reuse variable
      if (!isUndef(i)) {
        if (i.create) i.create(vnode);
        if (i.insert) insertedVnodeQueue.push(vnode);
      }
    } else {
      elm = vnode.elm = document.createTextNode(vnode.text);
    }
    return elm;
  }

  function addVnodes(parentElm, before, vnodes, startIdx, endIdx) {
    if (isUndef(before)) {
      for (; startIdx <= endIdx; ++startIdx) {
        parentElm.appendChild(createElm(vnodes[startIdx]));
      }
    } else {
      var elm = before.elm;
      for (; startIdx <= endIdx; ++startIdx) {
        parentElm.insertBefore(createElm(vnodes[startIdx]), elm);
      }
    }
  }

  function invokeDestroyHook(vnode) {
    var i, j;
    for (i = 0; i < destroyCbs.length; ++i) destroyCbs[i](vnode);
    if (!isUndef(vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j]);
      }
    }
  }

  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var i, listeners, rm, ch = vnodes[startIdx];
      if (!isUndef(ch)) {
        listeners = removeCbs.length + 1;
        rm = createRmCb(parentElm, ch.elm, listeners);
        for (i = 0; i < removeCbs.length; ++i) removeCbs[i](ch, rm);
        invokeDestroyHook(ch);
        if (ch.data.hook && ch.data.hook.remove) {
          ch.data.hook.remove(ch, rm);
        } else {
          rm();
        }
      }
    }
  }

  function updateChildren(parentElm, oldCh, newCh) {
    var oldStartIdx = 0, newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
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
          parentElm.insertBefore(createElm(newStartVnode), oldStartVnode.elm);
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
    if (oldStartIdx > oldEndIdx) addVnodes(parentElm, oldStartVnode, newCh, newStartIdx, newEndIdx);
    else if (newStartIdx > newEndIdx) removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
  }

  function patchVnode(oldVnode, vnode) {
    var i, elm = vnode.elm = oldVnode.elm, oldCh = oldVnode.children, ch = vnode.children;
    if (!isUndef(vnode.data)) {
      for (i = 0; i < updateCbs.length; ++i) updateCbs[i](oldVnode, vnode);
    }
    if (isUndef(vnode.text)) {
      if (!isUndef(oldCh) && !isUndef(ch)) {
        updateChildren(elm, oldCh, ch);
      } else if (!isUndef(ch)) {
        addVnodes(elm, undefined, ch, 0, ch.length - 1);
      } else if (!isUndef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      }
    } else if (oldVnode.text !== vnode.text) {
      elm.childNodes[0].nodeValue = vnode.text;
    }
    return vnode;
  }

  return function(oldVnode, vnode) {
    var i;
    insertedVnodeQueue = [];
    for (i = 0; i < preCbs.length; ++i) preCbs[i]();
    patchVnode(oldVnode, vnode);
    for (i = 0; i < insertedVnodeQueue.length; ++i) {
      insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
    }
    insertedVnodeQueue = undefined;
    for (i = 0; i < postCbs.length; ++i) postCbs[i]();
    return vnode;
  };
}

module.exports = {init: init, emptyNodeAt: emptyNodeAt};
