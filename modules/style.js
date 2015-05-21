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
    if (name !== 'remove' &&
        cur !== oldStyle[name]) {
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
  var cur, name, elm = vnode.elm, idx, i = 0, maxDur = 0,
      compStyle, style = s.remove;
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

module.exports = {create: updateStyle, update: updateStyle, remove: applyRemoveStyle};
