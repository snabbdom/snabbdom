(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* jshint esnext: true */
'use strict';

var snabbdom = require('../../snabbdom.js');
var patch = snabbdom.init([require('../../modules/class'), require('../../modules/hero'), require('../../modules/style'), require('../../modules/eventlisteners')]);
var h = require('../../h.js');

var vnode;

var data = {
  selected: undefined,
  movies: [{ rank: 1, title: 'This is an', desc: 'Lorem ipsum dolor sit amet, sed pede integer vitae bibendum, accumsan sit, vulputate aenean tempora ipsum. Lorem sed id et metus, eros posuere suspendisse nec nunc justo, fusce augue placerat nibh purus suspendisse. Aliquam aliquam, ut eget. Mollis a eget sed nibh tincidunt nec, mi integer, proin magna lacus iaculis tortor. Aliquam vel arcu arcu, vivamus a urna fames felis vel wisi, cursus tortor nec erat dignissim cras sem, mauris ac venenatis tellus elit.' }, { rank: 2, title: 'example of', desc: 'Consequuntur ipsum nulla, consequat curabitur in magnis risus. Taciti mattis bibendum tellus nibh, at dui neque eget, odio pede ut, sapien pede, ipsum ut. Sagittis dui, sodales sem, praesent ipsum conubia eget lorem lobortis wisi.' }, { rank: 3, title: 'Snabbdom', desc: 'Quam lorem aliquam fusce wisi, urna purus ipsum pharetra sed, at cras sodales enim vestibulum odio cras, luctus integer phasellus.' }, { rank: 4, title: 'doing hero transitions', desc: 'Et orci hac ultrices id in. Diam ultrices luctus egestas, sem aliquam auctor molestie odio laoreet. Pede nam cubilia, diam vestibulum ornare natoque, aenean etiam fusce id, eget dictum blandit et mauris mauris. Metus amet ad, elit porttitor a aliquet commodo lacus, integer neque imperdiet augue laoreet, nonummy turpis lacus sed pulvinar condimentum platea. Wisi eleifend quis, tristique dictum, ac dictumst. Sem nec tristique vel vehicula fringilla, nibh eu et posuere mi rhoncus.' }, { rank: 5, title: 'using the', desc: 'Pede nam cubilia, diam vestibulum ornare natoque, aenean etiam fusce id, eget dictum blandit et mauris mauris. Metus amet ad, elit porttitor a aliquet commodo lacus, integer neque imperdiet augue laoreet, nonummy turpis lacus sed pulvinar condimentum platea. Wisi eleifend quis, tristique dictum, ac dictumst. Sem nec tristique vel vehicula fringilla, nibh eu et posuere mi rhoncus.' }, { rank: 6, title: 'module for hero transitions', desc: 'Sapien laoreet, ligula elit tortor nulla pellentesque, maecenas enim turpis, quae duis venenatis vivamus ultricies, nunc imperdiet sollicitudin ipsum malesuada. Ut sem. Wisi fusce nullam nibh enim. Nisl hymenaeos id sed sed in. Proin leo et, pulvinar nunc pede laoreet.' }, { rank: 7, title: 'click on ar element in', desc: 'Accumsan quia, id nascetur dui et congue erat, id excepteur, primis ratione nec. At nulla et. Suspendisse lobortis, lobortis in tortor fringilla, duis adipiscing vestibulum voluptates sociosqu auctor.' }, { rank: 8, title: 'the list', desc: 'Ante tellus egestas vel hymenaeos, ut viverra nibh ut, ipsum nibh donec donec dolor. Eros ridiculus vel egestas convallis ipsum, commodo ut venenatis nullam porta iaculis, suspendisse ante proin leo, felis risus etiam.' }, { rank: 9, title: 'to witness', desc: 'Metus amet ad, elit porttitor a aliquet commodo lacus, integer neque imperdiet augue laoreet, nonummy turpis lacus sed pulvinar condimentum platea. Wisi eleifend quis, tristique dictum, ac dictumst.' }, { rank: 10, title: 'the effect', desc: 'Et orci hac ultrices id in. Diam ultrices luctus egestas, sem aliquam auctor molestie odio laoreet. Pede nam cubilia, diam vestibulum ornare natoque, aenean etiam fusce id, eget dictum blandit et mauris mauris' }]
};

function select(m) {
  data.selected = m;
  render();
}

function render() {
  vnode = patch(vnode, view(data));
}

var fadeInOutStyle = {
  opacity: '0', delayed: { opacity: '1' }, remove: { opacity: '0' }
};

var detailView = function detailView(movie) {
  return h('div.page', { style: fadeInOutStyle }, [h('div.header', [h('div.header-content.detail', {
    style: { opacity: '1', remove: { opacity: '0' } } }, [h('div.rank', [h('span.header-rank.hero', { hero: { id: 'rank' + movie.rank } }, movie.rank), h('div.rank-circle', {
    style: { transform: 'scale(0)',
      delayed: { transform: 'scale(1)' },
      destroy: { transform: 'scale(0)' } } })]), h('div.hero.header-title', { hero: { id: movie.title } }, movie.title), h('div.spacer'), h('div.close', {
    on: { click: [select, undefined] },
    style: { transform: 'scale(0)',
      delayed: { transform: 'scale(1)' },
      destroy: { transform: 'scale(0)' } } }, 'x')])]), h('div.page-content', [h('div.desc', {
    style: { opacity: '0', transform: 'translateX(3em)',
      delayed: { opacity: '1', transform: 'translate(0)' },
      remove: { opacity: '0', position: 'absolute', top: '0', left: '0',
        transform: 'translateX(3em)' }
    }
  }, [h('h2', 'Description:'), h('span', movie.desc)])])]);
};

var overviewView = function overviewView(movies) {
  return h('div.page', { style: fadeInOutStyle }, [h('div.header', [h('div.header-content.overview', {
    style: fadeInOutStyle }, [h('div.header-title', {
    style: { transform: 'translateY(-2em)',
      delayed: { transform: 'translate(0)' },
      destroy: { transform: 'translateY(-2em)' } }
  }, 'Top 10 movies'), h('div.spacer')])]), h('div.page-content', [h('div.list', {
    style: { opacity: '0', delayed: { opacity: '1' },
      remove: { opacity: '0', position: 'absolute', top: '0', left: '0' } }
  }, movies.map(function (movie) {
    return h('div.row', {
      on: { click: [select, movie] } }, [h('div.hero.rank', [h('span.hero', { hero: { id: 'rank' + movie.rank } }, movie.rank)]), h('div.hero', { hero: { id: movie.title } }, movie.title)]);
  }))])]);
};

var view = function view(data) {
  return h('div', [data.selected ? detailView(data.selected) : overviewView(data.movies)]);
};

window.addEventListener('DOMContentLoaded', function () {
  var container = document.getElementById('container');
  vnode = patch(container, view(data));
  render();
});

},{"../../h.js":2,"../../modules/class":4,"../../modules/eventlisteners":5,"../../modules/hero":6,"../../modules/style":7,"../../snabbdom.js":8}],2:[function(require,module,exports){
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

function fnInvoker(arr) {
  return function (ev) {
    arr[0](ev);
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
      if (is.array(cur)) {
        elm.addEventListener(name, arrInvoker(cur));
      } else {
        cur = [cur];
        on[name] = cur;
        elm.addEventListener(name, fnInvoker(cur));
      }
    } else if (old.length === 2) {
      old[0] = cur[0]; // Deliberately modify old array since it's
      old[1] = cur[1]; // captured in closure created with `arrInvoker`
      on[name] = old;
    } else {
      old[0] = cur;
      on[name] = old;
    }
  }
}

module.exports = { create: updateEventListeners, update: updateEventListeners };

},{"../is":3}],6:[function(require,module,exports){
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

var removed, created;

function pre(oldVnode, vnode) {
  removed = {};
  created = [];
}

function create(oldVnode, vnode) {
  var hero = vnode.data.hero;
  if (hero && hero.id) {
    created.push(hero.id);
    created.push(vnode);
  }
}

function destroy(vnode) {
  var hero = vnode.data.hero;
  if (hero && hero.id) {
    removed[hero.id] = vnode;
  }
}

function post() {
  var i, id, newElm, oldVnode, oldElm, hRatio, wRatio, oldRect, newRect, dx, dy, origTransform, origTransition, newStyle, oldStyle;
  for (i = 0; i < created.length; i += 2) {
    id = created[i];
    newElm = created[i + 1].elm;
    oldVnode = removed[id];
    if (oldVnode) {
      newStyle = newElm.style;
      oldElm = oldVnode.elm;
      oldStyle = oldElm.style;
      newRect = newElm.getBoundingClientRect();
      oldRect = oldElm.getBoundingClientRect();
      dx = oldRect.left - newRect.left;
      dy = oldRect.top - newRect.top;
      wRatio = newRect.width / Math.max(oldRect.width, 1);
      hRatio = newRect.height / Math.max(oldRect.height, 1);
      // Animate new element
      origTransform = newStyle.transform;
      origTransition = newStyle.transition;
      newStyle.transition = origTransition + 'transform 0s';
      newStyle.transformOrigin = '0 0';
      newStyle.opacity = '0';
      newStyle.transform = origTransform + 'translate(' + dx + 'px, ' + dy + 'px) ' + 'scale(' + 1 / wRatio + ', ' + 1 / hRatio + ')';
      setNextFrame(newStyle, 'transition', origTransition);
      setNextFrame(newStyle, 'transform', origTransform);
      setNextFrame(newStyle, 'opacity', '1');
      // Animate old element
      oldStyle.position = 'absolute';
      oldStyle.top = newRect.top + 'px';
      oldStyle.left = newRect.left + 'px';
      oldStyle.transformOrigin = '0 0';
      oldStyle.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
      oldStyle.opacity = '1';
      document.body.appendChild(oldElm);
      setNextFrame(oldStyle, 'transform', 'scale(' + wRatio + ', ' + hRatio + ')');
      setNextFrame(oldStyle, 'opacity', '0');
      oldElm.addEventListener('transitionend', function (ev) {
        if (ev.propertyName === 'transform') document.body.removeChild(ev.target);
      });
    }
  }
  removed = created = undefined;
}

module.exports = { pre: pre, create: create, destroy: destroy, post: post };

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
      style = vnode.data.style || {},
      oldHasDel = ('delayed' in oldStyle);
  for (name in style) {
    cur = style[name];
    if (name === 'delayed') {
      for (name in style.delayed) {
        cur = style.delayed[name];
        if (!oldHasDel || cur !== oldStyle.delayed[name]) {
          setNextFrame(elm.style, name, cur);
        }
      }
    } else if (name !== 'remove' && cur !== oldStyle[name]) {
      elm.style[name] = cur;
    }
  }
}

function applyDestroyStyle(vnode) {
  var style,
      name,
      elm = vnode.elm,
      s = vnode.data.style;
  if (!s || !(style = s.destroy)) return;
  for (name in style) {
    elm.style[name] = style[name];
  }
}

function applyRemoveStyle(vnode, rm) {
  var s = vnode.data.style;
  if (!s || !s.remove) {
    rm();
    return;
  }
  var name,
      elm = vnode.elm,
      idx,
      i = 0,
      maxDur = 0,
      compStyle,
      style = s.remove,
      amount = 0,
      applied = [];
  for (name in style) {
    applied.push(name);
    elm.style[name] = style[name];
  }
  compStyle = getComputedStyle(elm);
  var props = compStyle['transition-property'].split(', ');
  for (; i < props.length; ++i) {
    if (applied.indexOf(props[i]) !== -1) amount++;
  }
  elm.addEventListener('transitionend', function (ev) {
    if (ev.target === elm) --amount;
    if (amount === 0) rm();
  });
}

module.exports = { create: updateStyle, update: updateStyle, destroy: applyDestroyStyle, remove: applyRemoveStyle };

},{}],8:[function(require,module,exports){
// jshint newcap: false
/* global require, module, document, Element */
'use strict';

var VNode = require('./vnode');
var is = require('./is');

function isUndef(s) {
  return s === undefined;
}
function isDef(s) {
  return s !== undefined;
}

function emptyNodeAt(elm) {
  return VNode(elm.tagName, {}, [], undefined, elm);
}

var emptyNode = VNode('', {}, [], undefined, undefined);

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
    if (isDef(key)) map[key] = i;
  }
  return map;
}

function createRmCb(parentElm, childElm, listeners) {
  return function () {
    //if (--listeners === 0) parentElm.removeChild(childElm);
    if (--listeners === 0) childElm.parentElement.removeChild(childElm);
  };
}

var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];

function init(modules) {
  var i,
      j,
      cbs = {};
  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (modules[j][hooks[i]] !== undefined) cbs[hooks[i]].push(modules[j][hooks[i]]);
    }
  }

  function createElm(vnode) {
    var i,
        data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode);
      if (isDef(i = data.vnode)) vnode = i;
    }
    var elm,
        children = vnode.children,
        sel = vnode.sel;
    if (isDef(sel)) {
      // Parse selector
      var hashIdx = sel.indexOf('#');
      var dotIdx = sel.indexOf('.', hashIdx);
      var hash = hashIdx > 0 ? hashIdx : sel.length;
      var dot = dotIdx > 0 ? dotIdx : sel.length;
      var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
      elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? document.createElementNS(i, tag) : document.createElement(tag);
      if (hash < dot) elm.id = sel.slice(hash + 1, dot);
      if (dotIdx > 0) elm.className = sel.slice(dot + 1).replace(/\./g, ' ');
      if (is.array(children)) {
        for (i = 0; i < children.length; ++i) {
          elm.appendChild(createElm(children[i]));
        }
      } else if (is.primitive(vnode.text)) {
        elm.appendChild(document.createTextNode(vnode.text));
      }
      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode);
      i = vnode.data.hook; // Reuse variable
      if (isDef(i)) {
        if (i.create) i.create(emptyNode, vnode);
        if (i.insert) insertedVnodeQueue.push(vnode);
      }
    } else {
      elm = vnode.elm = document.createTextNode(vnode.text);
    }
    return vnode.elm;
  }

  function addVnodes(parentElm, before, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      parentElm.insertBefore(createElm(vnodes[startIdx]), before);
    }
  }

  function invokeDestroyHook(vnode) {
    var i = vnode.data,
        j;
    if (isDef(i)) {
      if (isDef(i = i.hook) && isDef(i = i.destroy)) i(vnode);
      for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode);
      if (isDef(i = vnode.children)) {
        for (j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j]);
        }
      }
    }
  }

  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var i,
          listeners,
          rm,
          ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.sel)) {
          invokeDestroyHook(ch);
          listeners = cbs.remove.length + 1;
          rm = createRmCb(parentElm, ch.elm, listeners);
          for (i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm);
          if (isDef(i = ch.data) && isDef(i = i.hook) && isDef(i = i.remove)) {
            i(ch, rm);
          } else {
            rm();
          }
        } else {
          // Text node
          parentElm.removeChild(ch.elm);
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
    var oldKeyToIdx, idxInOld, elmToMove, before;

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
    if (oldStartIdx > oldEndIdx) {
      before = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function patchVnode(oldVnode, vnode) {
    var i, hook;
    if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
      i(oldVnode, vnode);
    }
    if (isDef(i = oldVnode.data) && isDef(i = i.vnode)) oldVnode = i;
    if (isDef(i = vnode.data) && isDef(i = i.vnode)) vnode = i;
    var elm = vnode.elm = oldVnode.elm,
        oldCh = oldVnode.children,
        ch = vnode.children;
    if (oldVnode === vnode) return;
    if (isDef(vnode.data)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode);
      i = vnode.data.hook;
      if (isDef(i) && isDef(i = i.update)) i(oldVnode, vnode);
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh, ch);
      } else if (isDef(ch)) {
        addVnodes(elm, null, ch, 0, ch.length - 1);
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      }
    } else if (oldVnode.text !== vnode.text) {
      elm.textContent = vnode.text;
    }
    if (isDef(hook) && isDef(i = hook.postpatch)) {
      i(oldVnode, vnode);
    }
    return vnode;
  }

  return function (oldVnode, vnode) {
    var i;
    insertedVnodeQueue = [];
    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]();
    if (oldVnode instanceof Element) {
      if (oldVnode.parentElement !== null) {
        createElm(vnode);
        oldVnode.parentElement.replaceChild(vnode.elm, oldVnode);
      } else {
        oldVnode = emptyNodeAt(oldVnode);
        patchVnode(oldVnode, vnode);
      }
    } else {
      patchVnode(oldVnode, vnode);
    }
    for (i = 0; i < insertedVnodeQueue.length; ++i) {
      insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
    }
    insertedVnodeQueue = undefined;
    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]();
    return vnode;
  };
}

module.exports = { init: init };

},{"./is":3,"./vnode":9}],9:[function(require,module,exports){
"use strict";

module.exports = function (sel, data, children, text, elm) {
  var key = data === undefined ? undefined : data.key;
  return { sel: sel, data: data, children: children,
    text: text, elm: elm, key: key };
};

},{}]},{},[1]);
