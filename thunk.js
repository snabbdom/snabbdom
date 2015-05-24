var h = require('./h');

function init(thunk) {
  var i, cur = thunk.data.thunk,
      args = cur.args;
  return (cur.vnode = cur.fn.apply(undefined, cur.args));
}

function patch(oldThunk, thunk) {
  var i, old = oldThunk.data.thunk,
      cur = thunk.data.thunk,
      oldArgs = old.args,
      args = cur.args;
  cur.vnode = old.vnode;
  for (i = 0; i < args.length; ++i) {
    if (oldArgs[i] !== args[i]) {
      cur.vnode = cur.fn.apply(undefined, args);
    }
  }
  return [old.vnode, cur.vnode];
}

module.exports = function(name, fn /* args */) {
  var i, args = [];
  for (i = 2; i < arguments.length; ++i) {
    args[i - 2] = arguments[i];
  }
  return h('thunk' + name, {
    hook: {init: init, patch: patch},
    thunk: {fn: fn, args: args},
  });
};
