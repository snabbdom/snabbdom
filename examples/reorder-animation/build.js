(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var snabbdom = require('../../snabbdom.js');
var patch = snabbdom.init([require('../../modules/class'), require('../../modules/props'), require('../../modules/style'), require('../../modules/eventlisteners')]);
var h = require('../../h.js');

var vnode;

var nextKey = 11;
var margin = 8;
var sortBy = 'rank';
var totalHeight = 0;
var originalData = [{ rank: 1, title: 'The Shawshank Redemption', desc: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', elmHeight: 0 }, { rank: 2, title: 'The Godfather', desc: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.', elmHeight: 0 }, { rank: 3, title: 'The Godfather: Part II', desc: 'The early life and career of Vito Corleone in 1920s New York is portrayed while his son, Michael, expands and tightens his grip on his crime syndicate stretching from Lake Tahoe, Nevada to pre-revolution 1958 Cuba.', elmHeight: 0 }, { rank: 4, title: 'The Dark Knight', desc: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, the caped crusader must come to terms with one of the greatest psychological tests of his ability to fight injustice.', elmHeight: 0 }, { rank: 5, title: 'Pulp Fiction', desc: 'The lives of two mob hit men, a boxer, a gangster\'s wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', elmHeight: 0 }, { rank: 6, title: 'Schindler\'s List', desc: 'In Poland during World War II, Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.', elmHeight: 0 }, { rank: 7, title: '12 Angry Men', desc: 'A dissenting juror in a murder trial slowly manages to convince the others that the case is not as obviously clear as it seemed in court.', elmHeight: 0 }, { rank: 8, title: 'The Good, the Bad and the Ugly', desc: 'A bounty hunting scam joins two men in an uneasy alliance against a third in a race to find a fortune in gold buried in a remote cemetery.', elmHeight: 0 }, { rank: 9, title: 'The Lord of the Rings: The Return of the King', desc: 'Gandalf and Aragorn lead the World of Men against Sauron\'s army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.', elmHeight: 0 }, { rank: 10, title: 'Fight Club', desc: 'An insomniac office worker looking for a way to change his life crosses paths with a devil-may-care soap maker and they form an underground fight club that evolves into something much, much more...', elmHeight: 0 }];
var data = [originalData[0], originalData[1], originalData[2], originalData[3], originalData[4], originalData[5], originalData[6], originalData[7], originalData[8], originalData[9]];

function changeSort(prop) {
  sortBy = prop;
  data.sort(function (a, b) {
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
  data = [{ rank: nextKey++, title: n.title, desc: n.desc, elmHeight: 0 }].concat(data);
  render();
  render();
}

function remove(movie) {
  data = data.filter(function (m) {
    return m !== movie;
  });
  render();
}

function movieView(movie) {
  return h('div.row', {
    key: movie.rank,
    style: { opacity: '0', transform: 'translate(-200px)',
      'd-transform': 'translateY(' + movie.offset + 'px)', 'd-opacity': '1',
      remove: { opacity: '0', transform: 'translateY(' + movie.offset + 'px) translateX(200px)' } },
    hook: { insert: function insert(vnode) {
        movie.elmHeight = vnode.elm.offsetHeight;
      } } }, [h('div', { style: { fontWeight: 'bold' } }, movie.rank), h('div', movie.title), h('div', movie.desc), h('div.btn.rm-btn', { on: { click: [remove, movie] } }, 'x')]);
}

function render() {
  data = data.reduce(function (acc, m) {
    var last = acc[acc.length - 1];
    m.offset = last ? last.offset + last.elmHeight + margin : margin;
    return acc.concat(m);
  }, []);
  totalHeight = data[data.length - 1].offset + data[data.length - 1].elmHeight;
  vnode = patch(vnode, view(data));
}

function view(data) {
  return h('div', [h('h1', 'Top 10 movies'), h('div', [h('a.btn.add', { on: { click: add } }, 'Add'), 'Sort by: ', h('span.btn-group', [h('a.btn.rank', { 'class': { active: sortBy === 'rank' }, on: { click: [changeSort, 'rank'] } }, 'Rank'), h('a.btn.title', { 'class': { active: sortBy === 'title' }, on: { click: [changeSort, 'title'] } }, 'Title'), h('a.btn.desc', { 'class': { active: sortBy === 'desc' }, on: { click: [changeSort, 'desc'] } }, 'Description')])]), h('div.list', { style: { height: totalHeight + 'px' } }, data.map(movieView))]);
}

window.addEventListener('DOMContentLoaded', function () {
  var container = document.getElementById('container');
  vnode = patch(snabbdom.emptyNodeAt(container), view(data));
  render();
});

},{"../../h.js":2,"../../modules/class":4,"../../modules/eventlisteners":5,"../../modules/props":6,"../../modules/style":7,"../../snabbdom.js":8}],2:[function(require,module,exports){
'use strict';

var VNode = require('./vnode');
var is = require('./is');

module.exports = function h(sel, b, c) {
  var data = {},
      children,
      text,
      i;
  if (arguments.length === 3) {
    data = b;
    if (is.array(c)) {
      children = c;
    } else if (is.primitive(c)) {
      text = c;
    }
  } else if (arguments.length === 2) {
    if (is.array(b)) {
      children = b;
    } else if (is.primitive(b)) {
      text = b;
    } else {
      data = b;
    }
  }
  if (is.array(children)) {
    for (i = 0; i < children.length; ++i) {
      if (is.primitive(children[i])) children[i] = VNode(undefined, undefined, undefined, children[i]);
    }
  }
  return VNode(sel, data, children, text, undefined);
};

},{"./is":3,"./vnode":9}],3:[function(require,module,exports){
'use strict';

module.exports = {
  array: Array.isArray,
  primitive: function primitive(s) {
    return typeof s === 'string' || typeof s === 'number';
  } };

},{}],4:[function(require,module,exports){
'use strict';

function updateClass(oldVnode, vnode) {
  var cur,
      name,
      elm = vnode.elm,
      oldClass = oldVnode.data['class'] || {},
      klass = vnode.data['class'] || {};
  for (name in klass) {
    cur = klass[name];
    if (cur !== oldClass[name]) {
      elm.classList[cur ? 'add' : 'remove'](name);
    }
  }
}

module.exports = { create: updateClass, update: updateClass };

},{}],5:[function(require,module,exports){
'use strict';

var is = require('../is');

function arrInvoker(arr) {
  return function () {
    arr[0](arr[1]);
  };
}

function updateEventListeners(oldVnode, vnode) {
  var name,
      cur,
      old,
      elm = vnode.elm,
      oldOn = oldVnode.data.on || {},
      on = vnode.data.on;
  if (!on) return;
  for (name in on) {
    cur = on[name];
    old = oldOn[name];
    if (old === undefined) {
      elm.addEventListener(name, is.array(cur) ? arrInvoker(cur) : cur);
    } else if (is.array(old)) {
      old[0] = cur[0]; // Deliberately modify old array since it's
      old[1] = cur[1]; // captured in closure created with `arrInvoker`
    }
  }
}

module.exports = { create: updateEventListeners, update: updateEventListeners };

},{"../is":3}],6:[function(require,module,exports){
"use strict";

function updateProps(oldVnode, vnode) {
  var key,
      cur,
      old,
      elm = vnode.elm,
      oldProps = oldVnode.data.props || {},
      props = vnode.data.props || {};
  for (key in props) {
    cur = props[key];
    old = oldProps[key];
    if (old !== cur) {
      elm[key] = cur;
    }
  }
}

module.exports = { create: updateProps, update: updateProps };

},{}],7:[function(require,module,exports){
'use strict';

var raf = requestAnimationFrame || setTimeout;
var nextFrame = function nextFrame(fn) {
  raf(function () {
    raf(fn);
  });
};

function setNextFrame(obj, prop, val) {
  nextFrame(function () {
    obj[prop] = val;
  });
}

function updateStyle(oldVnode, vnode) {
  var cur,
      name,
      elm = vnode.elm,
      oldStyle = oldVnode.data.style || {},
      style = vnode.data.style || {};
  for (name in style) {
    cur = style[name];
    if (name !== 'remove' && cur !== oldStyle[name]) {
      if (name[0] === 'd' && name[1] === '-') {
        setNextFrame(elm.style, name.slice(2), cur);
      } else {
        elm.style[name] = cur;
      }
    }
  }
}

function applyRemoveStyle(vnode, rm) {
  var s = vnode.data.style;
  if (!s || !s.remove) return;
  var cur,
      name,
      elm = vnode.elm,
      idx,
      i = 0,
      maxDur = 0,
      compStyle,
      style = s.remove;
  var applied = [];
  for (name in style) {
    applied.push(name);
    elm.style[name] = style[name];
  }
  if (applied.length > 0) {
    compStyle = getComputedStyle(elm);
    var dels = compStyle['transition-delay'].split(', ');
    var durs = compStyle['transition-duration'].split(', ');
    var props = compStyle['transition-property'].split(', ');
    for (; i < applied.length; ++i) {
      idx = props.indexOf(applied[i]);
      if (idx !== -1) maxDur = Math.max(maxDur, parseFloat(dels[idx]) + parseFloat(durs[idx]));
    }
    setTimeout(rm, maxDur * 1000); // s to ms
  } else {
    rm();
  }
}

module.exports = { create: updateStyle, update: updateStyle, remove: applyRemoveStyle };

},{}],8:[function(require,module,exports){
// jshint newcap: false
'use strict';

var VNode = require('./vnode');
var is = require('./is');

function isUndef(s) {
  return s === undefined;
}

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
  var i,
      map = {},
      key;
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (!isUndef(key)) map[key] = i;
  }
  return map;
}

function createRmCb(parentElm, childElm, listeners) {
  return function () {
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

  modules.forEach(function (module) {
    if (module.create) createCbs.push(module.create);
    if (module.update) updateCbs.push(module.update);
    if (module.remove) removeCbs.push(module.remove);
    if (module.destroy) destroyCbs.push(module.destroy);
    if (module.pre) preCbs.push(module.pre);
    if (module.post) postCbs.push(module.post);
  });

  function createElm(vnode) {
    var i,
        elm,
        children = vnode.children,
        sel = vnode.sel;
    if (!isUndef(sel)) {
      // Parse selector
      var hashIdx = sel.indexOf('#');
      var dotIdx = sel.indexOf('.', hashIdx);
      var hash = hashIdx > 0 ? hashIdx : sel.length;
      var dot = dotIdx > 0 ? dotIdx : sel.length;
      var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
      elm = vnode.elm = document.createElement(tag);
      if (hash < dot) elm.id = sel.slice(hash + 1, dot);
      if (dotIdx > 0) elm.className = sel.slice(dot + 1).replace(/\./g, ' ');
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
      var i,
          listeners,
          rm,
          ch = vnodes[startIdx];
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
    var oldStartIdx = 0,
        newStartIdx = 0;
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
      } else if (sameVnode(oldStartVnode, newEndVnode)) {
        // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode);
        parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling);
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode);
        parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        idxInOld = oldKeyToIdx[newStartVnode.key];
        if (isUndef(idxInOld)) {
          // New element
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
    if (oldStartIdx > oldEndIdx) addVnodes(parentElm, oldStartVnode, newCh, newStartIdx, newEndIdx);else if (newStartIdx > newEndIdx) removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
  }

  function patchVnode(oldVnode, vnode) {
    var i,
        elm = vnode.elm = oldVnode.elm,
        oldCh = oldVnode.children,
        ch = vnode.children;
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

  return function (oldVnode, vnode) {
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

module.exports = { init: init, emptyNodeAt: emptyNodeAt };

},{"./is":3,"./vnode":9}],9:[function(require,module,exports){
"use strict";

module.exports = function (sel, data, children, text, elm) {
  var key = data === undefined ? undefined : data.key;
  return { sel: sel, data: data, children: children,
    text: text, elm: elm, key: key };
};

},{}]},{},[1]);
