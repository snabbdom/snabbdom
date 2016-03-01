function updateProps(oldVnode, vnode) {
  var key, cur, old, elm = vnode.elm,
      oldProps = oldVnode.data.props || {}, props = vnode.data.props || {};
  for (key in oldProps) {
    if (!props[key]) {
      delete elm[key];
    }
  }
  for (key in props) {
    cur = props[key];
    old = oldProps[key];
    if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
      if (key !== 'type') elm[key] = cur;
      else {
        try { elm[key] = cur; } catch (e) { elm.type = 'text' };
      }
    }
  }
}

module.exports = {create: updateProps, update: updateProps};
