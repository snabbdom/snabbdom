function updateAttrs(oldVnode, vnode) {
  var key, cur, old, elm = vnode.elm,
      oldAttrs = oldVnode.data.attrs || {}, attrs = vnode.data.attrs || {};
  
  // update modified attributes, add new attributes
  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      // TODO: add support to namespaced attributes (setAttributeNS)
      elm.setAttribute(key, cur);
    }
  }
  //remove removed attributes
  // use `in` operator since the previous `for` iterations uses it (.i.e. )
  // the other option is to remove all attributes with value == undefined
  for (key in oldAttrs) {
    if (!(key in attrs)) {
      elm.removeAttribute(key);
    }
  }
}

module.exports = {create: updateAttrs, update: updateAttrs};
