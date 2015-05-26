var is = require('../is');

function arrInvoker(arr) {
  return function() { arr[0](arr[1]); };
}

function updateEventListeners(oldVnode, vnode) {
  var name, cur, old, elm = vnode.elm,
      oldOn = oldVnode.data.on || {}, on = vnode.data.on;
  if (!on) return;
  for (name in on) {
    cur = on[name];
    old = oldOn[name];
    if (old === undefined) {
      elm.addEventListener(name, is.array(cur) ? arrInvoker(cur) : cur);
    } else if (is.array(old)) {
      old[0] = cur[0]; // Deliberately modify old array since it's
      old[1] = cur[1]; // captured in closure created with `arrInvoker`
      on[name]  = old;
    }
  }
}

module.exports = {create: updateEventListeners, update: updateEventListeners};
