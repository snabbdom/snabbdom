var raf = requestAnimationFrame || setTimeout;
var nextFrame = function(fn) { raf(function() { raf(fn); }); };

function setNextFrame(obj, prop, val) {
  nextFrame(function() { obj[prop] = val; });
}

function updateStyle(oldVnode, vnode) {
  var cur, name, elm = vnode.elm,
      oldStyle = oldVnode.data.style || {},
      style = vnode.data.style || {};
  for (name in style) {
    cur = style[name];
    if (cur !== oldStyle[name]) {
      if (name[0] === 'a' && name[1] === '-') {
        setNextFrame(elm.style, name.slice(2), cur);
      } else {
        elm.style[name] = cur;
      }
    }
  }
}

module.exports = {create: updateStyle, update: updateStyle};
