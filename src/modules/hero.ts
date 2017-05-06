import {VNode, VNodeData} from '../vnode';
import {Module} from './module';

export type Hero = { id: string }

var raf = (typeof window !== 'undefined' && window.requestAnimationFrame) || setTimeout;
var nextFrame = function(fn: any) { raf(function() { raf(fn); }); };

function setNextFrame(obj: any, prop: string, val: any): void {
  nextFrame(function() { obj[prop] = val; });
}

function getTextNodeRect(textNode: Text): ClientRect | undefined {
  var rect: ClientRect | undefined;
  if (document.createRange) {
    var range = document.createRange();
    range.selectNodeContents(textNode);
    if (range.getBoundingClientRect) {
        rect = range.getBoundingClientRect();
    }
  }
  return rect;
}

function calcTransformOrigin(isTextNode: boolean,
                             textRect: ClientRect | undefined,
                             boundingRect: ClientRect): string {
  if (isTextNode) {
    if (textRect) {
      //calculate pixels to center of text from left edge of bounding box
      var relativeCenterX = textRect.left + textRect.width/2 - boundingRect.left;
      var relativeCenterY = textRect.top + textRect.height/2 - boundingRect.top;
      return relativeCenterX + 'px ' + relativeCenterY + 'px';
    }
  }
  return '0 0'; //top left
}

function getTextDx(oldTextRect: ClientRect | undefined,
                   newTextRect: ClientRect | undefined): number {
  if (oldTextRect && newTextRect) {
    return ((oldTextRect.left + oldTextRect.width/2) - (newTextRect.left + newTextRect.width/2));
  }
  return 0;
}
function getTextDy(oldTextRect: ClientRect | undefined,
                   newTextRect: ClientRect | undefined): number {
  if (oldTextRect && newTextRect) {
    return ((oldTextRect.top + oldTextRect.height/2) - (newTextRect.top + newTextRect.height/2));
  }
  return 0;
}

function isTextElement(elm: Element | Text): elm is Text {
  return elm.childNodes.length === 1 && elm.childNodes[0].nodeType === 3;
}

var removed: any, created: any;

function pre() {
  removed = {};
  created = [];
}

function create(oldVnode: VNode, vnode: VNode): void {
  var hero = (vnode.data as VNodeData).hero;
  if (hero && hero.id) {
    created.push(hero.id);
    created.push(vnode);
  }
}

function destroy(vnode: VNode): void {
  var hero = (vnode.data as VNodeData).hero;
  if (hero && hero.id) {
    var elm = vnode.elm;
    (vnode as any).isTextNode = isTextElement(elm as Element | Text); //is this a text node?
    (vnode as any).boundingRect = (elm as Element).getBoundingClientRect(); //save the bounding rectangle to a new property on the vnode
    (vnode as any).textRect = (vnode as any).isTextNode ? getTextNodeRect((elm as Element).childNodes[0] as Text) : null; //save bounding rect of inner text node
    var computedStyle = window.getComputedStyle(elm as Element, void 0); //get current styles (includes inherited properties)
    (vnode as any).savedStyle = JSON.parse(JSON.stringify(computedStyle)); //save a copy of computed style values
    removed[hero.id] = vnode;
  }
}

function post() {
  var i: number, id: any, newElm: Element, oldVnode: VNode, oldElm: Element,
      hRatio: number, wRatio: number,
      oldRect: ClientRect, newRect: ClientRect, dx: number, dy: number,
      origTransform: string | null, origTransition: string | null,
      newStyle: CSSStyleDeclaration, oldStyle: CSSStyleDeclaration,
      newComputedStyle: CSSStyleDeclaration, isTextNode: boolean,
      newTextRect: ClientRect | undefined, oldTextRect: ClientRect | undefined;
  for (i = 0; i < created.length; i += 2) {
    id = created[i];
    newElm = created[i+1].elm;
    oldVnode = removed[id];
    if (oldVnode) {
      isTextNode = (oldVnode as any).isTextNode && isTextElement(newElm); //Are old & new both text?
      newStyle = (newElm as HTMLElement).style;
      newComputedStyle = window.getComputedStyle(newElm, void 0); //get full computed style for new element
      oldElm = oldVnode.elm as Element;
      oldStyle = (oldElm as HTMLElement).style;
      //Overall element bounding boxes
      newRect = newElm.getBoundingClientRect();
      oldRect = (oldVnode as any).boundingRect; //previously saved bounding rect
      //Text node bounding boxes & distances
      if (isTextNode) {
        newTextRect = getTextNodeRect(newElm.childNodes[0] as Text);
        oldTextRect = (oldVnode as any).textRect;
        dx = getTextDx(oldTextRect, newTextRect);
        dy = getTextDy(oldTextRect, newTextRect);
      } else {
        //Calculate distances between old & new positions
        dx = oldRect.left - newRect.left;
        dy = oldRect.top - newRect.top;
      }
      hRatio = newRect.height / (Math.max(oldRect.height, 1));
      wRatio = isTextNode ? hRatio : newRect.width / (Math.max(oldRect.width, 1)); //text scales based on hRatio
      // Animate new element
      origTransform = newStyle.transform;
      origTransition = newStyle.transition;
      if (newComputedStyle.display === 'inline') //inline elements cannot be transformed
        newStyle.display = 'inline-block';        //this does not appear to have any negative side effects
      newStyle.transition = origTransition + 'transform 0s';
      newStyle.transformOrigin = calcTransformOrigin(isTextNode, newTextRect, newRect);
      newStyle.opacity = '0';
      newStyle.transform = origTransform + 'translate('+dx+'px, '+dy+'px) ' +
                               'scale('+1/wRatio+', '+1/hRatio+')';
      setNextFrame(newStyle, 'transition', origTransition);
      setNextFrame(newStyle, 'transform', origTransform);
      setNextFrame(newStyle, 'opacity', '1');
      // Animate old element
      for (var key in (oldVnode as any).savedStyle) { //re-apply saved inherited properties
        if (parseInt(key) != key as any as number) {
          var ms = key.substring(0,2) === 'ms';
          var moz = key.substring(0,3) === 'moz';
          var webkit = key.substring(0,6) === 'webkit';
          if (!ms && !moz && !webkit) //ignore prefixed style properties
            (oldStyle as any)[key] = (oldVnode as any).savedStyle[key];
        }
      }
      oldStyle.position = 'absolute';
      oldStyle.top = oldRect.top + 'px'; //start at existing position
      oldStyle.left = oldRect.left + 'px';
      oldStyle.width = oldRect.width + 'px'; //Needed for elements who were sized relative to their parents
      oldStyle.height = oldRect.height + 'px'; //Needed for elements who were sized relative to their parents
      oldStyle.margin = '0'; //Margin on hero element leads to incorrect positioning
      oldStyle.transformOrigin = calcTransformOrigin(isTextNode, oldTextRect, oldRect);
      oldStyle.transform = '';
      oldStyle.opacity = '1';
      document.body.appendChild(oldElm);
      setNextFrame(oldStyle, 'transform', 'translate('+ -dx +'px, '+ -dy +'px) scale('+wRatio+', '+hRatio+')'); //scale must be on far right for translate to be correct
      setNextFrame(oldStyle, 'opacity', '0');
      oldElm.addEventListener('transitionend', function (ev: TransitionEvent) {
        if (ev.propertyName === 'transform')
          document.body.removeChild(ev.target as Node);
      });
    }
  }
  removed = created = undefined;
}

export const heroModule = {pre, create, destroy, post} as Module;
export default heroModule;