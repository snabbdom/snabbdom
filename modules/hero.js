var raf = requestAnimationFrame || setTimeout;
var nextFrame = function(fn) { raf(function() { raf(fn); }); };

function setNextFrame(obj, prop, val) {
  nextFrame(function() { obj[prop] = val; });
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
  var i, id, newElm, oldVnode, oldElm, hRatio, wRatio,
      oldRect, newRect, dx, dy, origTransform, origTransition,
      newStyle, oldStyle;
  for (i = 0; i < created.length; i += 2) {
    id = created[i];
    newElm = created[i+1].elm;
    oldVnode = removed[id];
    if (oldVnode) {
      newStyle = newElm.style;
      oldElm = oldVnode.elm;
      oldStyle = oldElm.style;
      newRect = newElm.getBoundingClientRect();
      oldRect = oldElm.getBoundingClientRect();
      dx = oldRect.left - newRect.left;
      dy = oldRect.top - newRect.top;
      wRatio = newRect.width / (Math.max(oldRect.width, 1));
      hRatio = newRect.height / (Math.max(oldRect.height, 1));
      // Animate new element
      origTransform = newStyle.transform;
      origTransition = newStyle.transition;
      newStyle.transition = origTransition + 'transform 0s';
      newStyle.transformOrigin = '0 0';
      newStyle.opacity = '0';
      newStyle.transform = origTransform + 'translate('+dx+'px, '+dy+'px) ' +
                               'scale('+1/wRatio+', '+1/hRatio+')';
      setNextFrame(newStyle, 'transition', origTransition);
      setNextFrame(newStyle, 'transform', origTransform);
      setNextFrame(newStyle, 'opacity', '1');
      // Animate old element
      oldStyle.position = 'absolute';
      oldStyle.top = newRect.top + 'px';
      oldStyle.left = newRect.left + 'px';
      oldStyle.transformOrigin = '0 0';
      oldStyle.transform = 'translate('+dx+'px, '+dy+'px)';
      oldStyle.opacity = '1';
      document.body.appendChild(oldElm);
      setNextFrame(oldStyle, 'transform', 'scale('+wRatio+', '+hRatio+')');
      setNextFrame(oldStyle, 'opacity', '0');
      oldElm.addEventListener('transitionend', function(ev) {
        if (ev.propertyName === 'transform')
          document.body.removeChild(ev.target);
      });
    }
  }
  removed = created = undefined;
}

module.exports = {pre: pre, create: create, destroy: destroy, post: post};
