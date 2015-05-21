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
    if ((name[0] !== 'r' || name[0] !== '-') &&
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
  var cur, name, elm = vnode.elm, idx, i = 0, maxDur = 0,
      compStyle, style = vnode.data.style || {};
  var applied = [];
  for (name in style) {
    cur = style[name];
    if (name[0] === 'r' && name[1] === '-') {
      name = name.slice(2);
      applied.push(name);
      setNextFrame(elm.style, name, cur);
    }
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
