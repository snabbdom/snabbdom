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
    vnode.boundingRect = vnode.elm.getBoundingClientRect() //save the bounding rectangle to a new property on the vnode
    var computedStyle = window.getComputedStyle(vnode.elm, null) //save current styles (includes inherited properties) - read only
    vnode.savedStyle = {
      textAlign: computedStyle.textAlign,
      //todo: more properties?
    }
    removed[hero.id] = vnode;
  }
}

function post() {
  var i, id, newElm, oldVnode, oldElm, hRatio, wRatio,
      oldRect, newRect, dx, dy, origTransform, origTransition,
      newStyle, oldStyle, newComputedStyle, isTextNode;
  for (i = 0; i < created.length; i += 2) {
    id = created[i];
    newElm = created[i+1].elm;
    oldVnode = removed[id];
    if (oldVnode) {
      newStyle = newElm.style;
      newComputedStyle = window.getComputedStyle(newElm, null) //get full computed style for new element
      oldElm = oldVnode.elm;
      oldStyle = oldElm.style;
      newRect = newElm.getBoundingClientRect();
      oldRect = oldVnode.boundingRect; //Use previously saved bounding rect
      dx = oldRect.left - newRect.left;
      dy = oldRect.top - newRect.top;
      // Determine if these are text elements.  if so, scale based on hRatio only.
      isTextNode = oldElm.childNodes.length === 1 && oldElm.childNodes[0].nodeType === 3
      hRatio = newRect.height / (Math.max(oldRect.height, 1));
      wRatio = isTextNode ? hRatio : newRect.width / (Math.max(oldRect.width, 1));
      // Animate new element
      origTransform = newStyle.transform;
      origTransition = newStyle.transition;
      if (newComputedStyle.display === 'inline') //inline elements cannot be transformed
        newStyle.display = 'inline-block'        //this does not appear to have any negative side effects
      newStyle.transition = origTransition + 'transform 0s';
      newStyle.transformOrigin = isTextNode ? 'center top' : '0 0'; //made conditional
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
      oldStyle.width = oldRect.width + 'px'; //Needed for elements who were sized relative to their parents
      oldStyle.height = oldRect.height + 'px'; //Needed for elements who were sized relative to their parents
      oldStyle.margin = 0; //Margin on hero element leads to incorrect positioning
      oldStyle.transformOrigin = isTextNode ? 'center top' : '0 0'; //made conditional
      oldStyle.transform = 'translate('+dx+'px, '+dy+'px)';
      oldStyle.opacity = '1';
      oldStyle.textAlign = oldVnode.savedStyle.textAlign; //needed when elements have inherited property
      // if (oldVnode.savedStyle.display === 'inline')
      //   oldStyle.display = 'inline-block'
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
