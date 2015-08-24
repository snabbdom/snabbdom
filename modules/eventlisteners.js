var is = require('../is');

function arrInvoker(arr) {
  return function() {
    // Special case when length is two, for performance
    arr.length === 2 ? arr[0](arr[1]) : arr[0].apply(undefined, arr.slice(1));
  };
}

function fnInvoker(o) {
  return function(ev) { o.fn(ev); };
}

function assoc(k, v, obj) {
  var keys = Object.keys(obj), i = keys.length, copy = {};
  while (i--) copy[keys[i]] = obj[keys[i]];
  copy[k] = v;
  return copy;
}

function updateEventListeners(oldVnode, vnode) {
  var name, cur, old, elm = vnode.elm,
      oldOn = oldVnode.data.on || {}, on = vnode.data.on;
  if (!on) return;
  for (name in on) {
    cur = on[name];
    old = oldOn[name];
    if (old === undefined) {
      if (is.array(cur)) {
        elm.addEventListener(name, arrInvoker(cur));
      } else {
        cur = {fn: cur};
        vnode.data.on = assoc(name, cur, on);
        elm.addEventListener(name, fnInvoker(cur));
      }
    } else if (is.array(old)) {
      // Deliberately modify old array since it's captured in closure created with `arrInvoker`
      old.length = cur.length;
      for (var i = 0; i < old.length; ++i) old[i] = cur[i];
      vnode.data.on = assoc(name, old, on);
    } else {
      old.fn = cur;
      vnode.data.on = assoc(name, old, on);
    }
  }
}

module.exports = {create: updateEventListeners, update: updateEventListeners};
