(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//var R = require('ramda');
//var flyd = require('flyd');
//var stream = flyd.stream;
//var scanMerge = require('flyd-scanmerge');

var snabbdom = require('../../snabbdom.js');
var h = snabbdom.h;

var vnode;

var nextKey = 11;
var margin = 8;
var sortBy = 'rank';
var totalHeight = 0;
var originalData = [
  {rank: 1, title: 'The Shawshank Redemption', desc: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', elmHeight: 0},
  {rank: 2, title: 'The Godfather', desc: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.', elmHeight: 0},
  {rank: 3, title: 'The Godfather: Part II', desc: 'The early life and career of Vito Corleone in 1920s New York is portrayed while his son, Michael, expands and tightens his grip on his crime syndicate stretching from Lake Tahoe, Nevada to pre-revolution 1958 Cuba.', elmHeight: 0},
  {rank: 4, title: 'The Dark Knight', desc: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, the caped crusader must come to terms with one of the greatest psychological tests of his ability to fight injustice.', elmHeight: 0},
  {rank: 5, title: 'Pulp Fiction', desc: 'The lives of two mob hit men, a boxer, a gangster\'s wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', elmHeight: 0},
  {rank: 6, title: 'Schindler\'s List', desc: 'In Poland during World War II, Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.', elmHeight: 0},
  {rank: 7, title: '12 Angry Men', desc: 'A dissenting juror in a murder trial slowly manages to convince the others that the case is not as obviously clear as it seemed in court.', elmHeight: 0},
  {rank: 8, title: 'The Good, the Bad and the Ugly', desc: 'A bounty hunting scam joins two men in an uneasy alliance against a third in a race to find a fortune in gold buried in a remote cemetery.', elmHeight: 0},
  {rank: 9, title: 'The Lord of the Rings: The Return of the King', desc: 'Gandalf and Aragorn lead the World of Men against Sauron\'s army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.', elmHeight: 0},
  {rank: 10, title: 'Fight Club', desc: 'An insomniac office worker looking for a way to change his life crosses paths with a devil-may-care soap maker and they form an underground fight club that evolves into something much, much more...', elmHeight: 0},
];
var data = [
  originalData[0],
  originalData[1],
  originalData[2],
  originalData[3],
  originalData[4],
  originalData[5],
  originalData[6],
  originalData[7],
  originalData[8],
  originalData[9],
];

function changeSort(prop) {
  sortBy = prop;
  data.sort(function(a, b) {
    if (a[prop] > b[prop]) {
      return 1;
    }
    if (a[prop] < b[prop]) {
      return -1;
    }
    return 0;
  });
  render();
}

function add() {
  var n = originalData[Math.floor(Math.random() * 10)];
  data = [{rank: nextKey++, title: n.title, desc: n.desc, elmHeight: 0}].concat(data);
  render();
}

function remove(movie) {
  data = data.filter(function(m) { return m !== movie; });
  render();
}

function movieView(movie) {
  return h('div.row', {
    key: movie.rank,
    style: {'a-transform': 'translateY(' + movie.offset + 'px)'},
    oncreate: function(vnode) {
      vnode.elm.classList.add('enter');
      setTimeout(function() { vnode.elm.classList.remove('enter'); });
    },
    oninsert: function(vnode) {
      movie.elmHeight = vnode.elm.offsetHeight;
      setTimeout(render, 0);
    },
    onremove: function(vnode, rm) {
      vnode.elm.classList.add('leave');
      setTimeout(rm, 500);
    },
  }, [
    h('div', movie.rank),
    h('div', movie.title),
    h('div', movie.desc),
    h('div.rm-btn', {onclick: [remove, movie]}, 'x'),
  ]);
}

function render() {
  data = data.reduce(function(acc, m) {
    var last = acc[acc.length - 1];
    m.offset = last ? last.offset + last.elmHeight + margin : margin;
    return acc.concat(m);
  }, []);
  totalHeight = data[data.length - 1].offset + data[data.length - 1].elmHeight;
  vnode = snabbdom.patch(vnode, view(data));
}

function view(data) {
  return h('div', [
    h('h1', 'Top 10 movies'),
    h('div', {
    }, [h('a.btn.add', {onclick: add}, 'Add'),
        'Sort by: ', h('a.btn.rank', {class: {active: sortBy === 'rank'}, onclick: [changeSort, 'rank']}, 'Rank'), ' ',
                     h('a.btn.title', {class: {active: sortBy === 'title'}, onclick: [changeSort, 'title']}, 'Title'), ' ',
                     h('a.btn.desc', {class: {active: sortBy === 'desc'}, onclick: [changeSort, 'desc']}, 'Description')]),
    h('div.list', {style: {height: totalHeight+'px'}}, data.map(movieView)),
  ]);
}

window.addEventListener('DOMContentLoaded', function() {
  var container = document.getElementById('container');
  vnode = snabbdom.patch(snabbdom.emptyNodeAt(container), view(data));
});

},{"../../snabbdom.js":2}],2:[function(require,module,exports){
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

var insertCbQueue;

var nextFrame = requestAnimationFrame || setTimeout;

function setNextFrame(obj, prop, val) {
  nextFrame(function() { obj[prop] = val; });
}

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
  var key, name, cur, old, oldProps = oldVnode.props, props = vnode.props,
      val = props.className;
  if (isUndef(oldProps) || val !== oldProps.className) elm.className = val;
  for (key in props) {
    val = props[key];
    if (key === 'style' || key === 'class') {
      for (name in val) {
        cur = val[name];
        if (cur !== oldProps[key][name]) {
          if (key === 'style') {
            if (name[0] === 'a' && name[1] === '-') {
              setNextFrame(elm.style, name.slice(2), cur);
            } else {
              elm.style[name] = cur;
            }
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
    } else if (key !== 'key' && key !== 'className') {
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
    if (vnode.props.oncreate) vnode.props.oncreate(vnode);
    if (vnode.props.oninsert) insertCbQueue.push(vnode);
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
  var i, managesQueue = false, elm = newVnode.elm = oldVnode.elm;
  if (isUndef(insertCbQueue)) {
    insertCbQueue = [];
    managesQueue = true;
  }
  if (!isUndef(newVnode.props)) updateProps(elm, oldVnode, newVnode);
  if (isUndef(newVnode.text)) {
    updateChildren(elm, oldVnode.children, newVnode.children);
  } else if (oldVnode.text !== newVnode.text) {
    elm.textContent = newVnode.text;
  }
  if (managesQueue) {
    for (i = 0; i < insertCbQueue.length; ++i) {
      insertCbQueue[i].props.oninsert(insertCbQueue[i]);
    }
    insertCbQueue = undefined;
  }
  return newVnode;
}

return {h: h, createElm: createElm, patch: patchVnode, emptyNodeAt: emptyNodeAt, emptyNode: emptyNode};

}));

},{}]},{},[1]);
